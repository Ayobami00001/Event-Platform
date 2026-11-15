import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Ticket from "@/models/Ticket";
import User from "@/models/User";

type PaystackPayment = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string | null;
  customer?: { email?: string };
  metadata?: {
    bookingId?: string;
    userId?: string;
  } | string | null;
};

export async function confirmPaystackBooking(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    throw new Error("Paystack secret key is missing.");
  }

  await connectDB();

  const booking = await Booking.findOne({
    paymentReference: reference,
  });

  if (!booking) {
    throw new Error("Payment booking not found.");
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to contact Paystack.");
  }

  const result = await response.json();

  if (!result.status || !result.data) {
    throw new Error("Paystack verification failed.");
  }

  const payment = result.data as PaystackPayment;

  if (payment.status !== "success") {
    throw new Error("Payment has not succeeded.");
  }

  const expectedAmount = Math.round(booking.totalPrice * 100);

  if (
    !Number.isSafeInteger(expectedAmount) ||
    expectedAmount <= 0 ||
    payment.reference !== reference ||
    payment.amount !== expectedAmount ||
    payment.currency !== "NGN" ||
    booking.currency !== "NGN"
  ) {
    throw new Error("Payment details do not match the booking.");
  }

  const metadata =
    typeof payment.metadata === "string"
      ? JSON.parse(payment.metadata)
      : payment.metadata;

  if (
    metadata?.bookingId !== String(booking._id) ||
    metadata?.userId !== String(booking.user)
  ) {
    throw new Error("Payment metadata does not match the booking.");
  }

  const customer = await User.findById(booking.user);

  if (
    !customer ||
    !payment.customer?.email ||
    payment.customer.email.toLowerCase() !==
      customer.email.toLowerCase()
  ) {
    throw new Error("Payment customer does not match.");
  }

  // Never revive a cancelled or refunded booking automatically.
  if (
    booking.bookingStatus === "CANCELLED" ||
    booking.paymentStatus === "REFUNDED" ||
    booking.paymentStatus === "FAILED"
  ) {
    throw new Error(
      "Payment received for an inactive booking. Manual review required.",
    );
  }

  // Only the first successful update changes a pending booking.
  await Booking.findOneAndUpdate(
    {
      _id: booking._id,
      bookingStatus: "PENDING",
      paymentStatus: "UNPAID",
      paymentReference: reference,
    },
    {
      $set: {
        bookingStatus: "CONFIRMED",
        paymentStatus: "PAID",
        paidAt: payment.paid_at
          ? new Date(payment.paid_at)
          : new Date(),
      },
    },
  );

  const confirmed = await Booking.findById(booking._id);

  if (
    !confirmed ||
    confirmed.bookingStatus !== "CONFIRMED" ||
    confirmed.paymentStatus !== "PAID"
  ) {
    throw new Error("Booking confirmation requires review.");
  }

  // One ticket per seat, even if the webhook is delivered again.
  for (let i = 1; i <= confirmed.quantity; i++) {
    const ticketCode = `CNCG-${confirmed._id}-${i}`;

    await Ticket.updateOne(
      { ticketCode },
      {
        $setOnInsert: {
          booking: confirmed._id,
          ticketCode,
        },
      },
      { upsert: true },
    );
  }

  return confirmed;
}