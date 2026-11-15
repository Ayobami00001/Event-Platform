"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";

const CREATE_BOOKING = `
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      totalPrice
      bookingStatus
      paymentStatus
    }
  }
`;

const INITIALIZE_PAYMENT = `
  mutation InitializePaystackPayment($bookingId: ID!) {
    initializePaystackPayment(bookingId: $bookingId) {
      authorizationUrl
      reference
    }
  }
`;

const GET_CHECKOUT_EVENT = `
  query GetCheckoutEvent($eventId: ID!) {
    getEventById(eventId: $eventId) {
      id
      title
      image
      startDate
      startTime
      endTime
      locationName
      city
      state
      country
      mode
      pricing
      price
      currency
      availableSeats
      status
    }
  }
`;

/** The database may contain an image copied as a Markdown link instead of a URL. */
function getEventImageUrl(value?: string | null): string | null {
  if (!value) return null;
  const url = value.match(/^\[https?:\/\/[^\]]+\]/)?.[0]?.slice(1, -1) || value;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}

type CheckoutEvent = {
  id: string;
  title: string;
  image?: string | null;
  startDate: string;
  startTime?: string | null;
  endTime?: string | null;
  locationName?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  mode: "ONLINE" | "PHYSICAL";
  pricing: "FREE" | "PAID";
  price?: number | null;
  currency?: "NGN" | null;
  availableSeats: number;
  status: string;
};

/** Compatible with both <CheckoutForm /> and <CheckoutForm eventId={eventid} />. */
export default function CheckoutForm({
  eventId: passedEventId,
}: {
  eventId?: string;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const routeEventId = params?.eventid ?? params?.eventId;

  const eventId = (
    passedEventId ||
    (Array.isArray(routeEventId) ? routeEventId[0] : routeEventId) ||
    pathname?.match(/^\/checkout\/([a-fA-F0-9]{24})\/?$/)?.[1] ||
    ""
  ).trim();

  const [quantity, setQuantity] = useState(1);
  const [event, setEvent] = useState<CheckoutEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setError("Missing event ID in checkout URL.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadEvent() {
      setLoading(true);
      setEvent(null);
      setError("");

      try {
        // Read directly from the same endpoint that was verified in DevTools.
        // This avoids conflating a transport/GraphQL error with a missing event.
        const token = localStorage.getItem("token");
        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: GET_CHECKOUT_EVENT,
            variables: { eventId },
          }),
          cache: "no-store",
          signal: controller.signal,
        });

        const result: {
          data?: { getEventById: CheckoutEvent | null };
          errors?: Array<{ message: string }>;
        } = await response.json();

        if (!response.ok || result.errors?.length) {
          throw new Error(
            result.errors?.[0]?.message ||
              `Event request failed (${response.status}).`,
          );
        }

        const found = result.data?.getEventById;
        if (!found) {
          throw new Error(`No event found for ID: ${eventId}`);
        }

        if (!controller.signal.aborted) setEvent(found);
      } catch (err) {
        if (!controller.signal.aborted) {
          setEvent(null);
          setError(
            err instanceof Error ? err.message : "Unable to load event.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadEvent();
    return () => controller.abort();
  }, [eventId]);

  const ticketPrice = event?.pricing === "FREE" ? 0 : (event?.price ?? 0);
  const currency = event?.currency ?? "NGN";
  const total = ticketPrice * quantity;
  // An approved event from an earlier date must not accept new bookings.
  const eventHasEnded = Boolean(
    event &&
    event.startDate &&
    event.startDate.slice(0, 10) < new Date().toISOString().slice(0, 10),
  );
  const isAvailable = Boolean(
    event &&
    !eventHasEnded &&
    ["APPROVED", "UPCOMING"].includes(event.status) &&
    event.availableSeats >= quantity &&
    event.availableSeats > 0,
  );
  const isUnsupportedCurrency = event?.pricing === "PAID" && currency !== "NGN";

  const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Date unavailable"
      : date.toLocaleDateString("en-NG", {
          weekday: "short",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  };

  const location =
    event?.mode === "ONLINE"
      ? "Online event"
      : [event?.locationName, event?.city, event?.state, event?.country]
          .filter(Boolean)
          .join(", ") || "Location to be announced";

  const decreaseQty = () => setQuantity((current) => Math.max(1, current - 1));
  const increaseQty = () => {
    if (!event) return;
    setQuantity((current) => Math.min(event.availableSeats, current + 1));
  };

  const handleCompletePurchase = async () => {
    if (processing) return;

    try {
      setProcessing(true);
      setError("");

      if (!event || !eventId) {
        throw new Error("Event details are unavailable.");
      }
      if (!["APPROVED", "UPCOMING"].includes(event.status) || eventHasEnded) {
        throw new Error("This event is not available for booking.");
      }
      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > event.availableSeats
      ) {
        throw new Error("The selected ticket quantity is unavailable.");
      }
      if (event.pricing === "PAID" && currency !== "NGN") {
        throw new Error("Only NGN payments are supported currently.");
      }
      if (
        event.pricing === "PAID" &&
        (!Number.isFinite(ticketPrice) || ticketPrice <= 0)
      ) {
        throw new Error("This event does not have a valid ticket price.");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const bookingResult = await graphqlRequest<{
        createBooking: {
          id: string;
          totalPrice: number;
          bookingStatus: string;
          paymentStatus: string;
        };
      }>({
        query: CREATE_BOOKING,
        variables: { input: { eventId, quantity } },
      });

      const booking = bookingResult.createBooking;
      if (!booking?.id) {
        throw new Error("Unable to create booking.");
      }

      if (booking.bookingStatus === "CONFIRMED" && booking.totalPrice === 0) {
        router.push("/user/booking");
        return;
      }

      const paymentResult = await graphqlRequest<{
        initializePaystackPayment: {
          authorizationUrl: string;
          reference: string;
        };
      }>({
        query: INITIALIZE_PAYMENT,
        variables: { bookingId: booking.id },
      });

      const paymentUrl =
        paymentResult.initializePaystackPayment?.authorizationUrl;
      if (!paymentUrl)
        throw new Error("Paystack payment link was not returned.");

      const url = new URL(paymentUrl);
      if (
        url.protocol !== "https:" ||
        !(
          url.hostname === "paystack.com" ||
          url.hostname.endsWith(".paystack.com")
        )
      ) {
        throw new Error("Invalid Paystack payment link.");
      }
      sessionStorage.setItem("pendingCheckoutEventId", eventId);
      window.location.assign(url.toString());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to complete purchase.",
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-32 text-center text-slate-600">
        Loading checkout...
      </section>
    );
  }

  if (!event) {
    return (
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-32 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Checkout unavailable
        </h1>
        <p className="mt-3 text-slate-600">{error || "Event not found."}</p>
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white"
        >
          Browse events
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-32 md:px-12">
      <header className="mb-12">
        <div className="flex flex-col items-start gap-8 md:flex-row">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-200 shadow-lg md:w-1/3">
            {getEventImageUrl(event.image) ? (
              <img
                src={getEventImageUrl(event.image)!}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
                Event image unavailable
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {event.mode === "ONLINE" ? "Online Event" : "Physical Event"}
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-5xl">
              {event.title}
            </h1>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <span className="text-indigo-600">📅</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Date</p>
                  <p className="font-bold">{formatDate(event.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <span className="text-indigo-600">⏰</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Time</p>
                  <p className="font-bold">
                    {[event.startTime, event.endTime]
                      .filter(Boolean)
                      .join(" - ") || "To be announced"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm sm:col-span-2">
                <span className="text-indigo-600">📍</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Location
                  </p>
                  <p className="font-bold">{location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">Select Tickets</h2>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
                General Admission
              </span>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-3xl bg-slate-100 p-6 md:flex-row md:items-center">
              <div className="space-y-1">
                <p className="text-lg font-bold">Standard Pass</p>
                <p className="text-sm text-slate-500">
                  {event.availableSeats}{" "}
                  {event.availableSeats === 1 ? "ticket" : "tickets"} remaining
                </p>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-xl font-extrabold text-indigo-700">
                  {event.pricing === "FREE" ? "Free" : formatPrice(ticketPrice)}
                </p>
                <div className="flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={decreaseQty}
                    disabled={processing || quantity <= 1}
                    aria-label="Decrease ticket quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-indigo-600 transition hover:bg-slate-100 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-lg font-bold">
                    {String(quantity).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={increaseQty}
                    disabled={processing || quantity >= event.availableSeats}
                    aria-label="Increase ticket quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="mb-5 text-2xl font-bold">Payment Information</h2>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
              <p className="text-lg font-bold text-slate-900">
                {event.pricing === "FREE"
                  ? "Free Registration"
                  : "Secure checkout with Paystack"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {event.pricing === "FREE"
                  ? "No payment is required. Complete your booking to register for this event."
                  : "After clicking Complete Purchase, you'll be redirected to Paystack to pay securely. Concierge never collects your card number, expiry date, or CVV."}
              </p>
            </div>
            {isUnsupportedCurrency && (
              <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                This event uses {currency}. Paystack checkout is currently
                configured for NGN events only.
              </p>
            )}
            {!isAvailable && (
              <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                {eventHasEnded
                  ? "This event date has passed. Registration is closed."
                  : "This event is currently unavailable for booking."}
              </p>
            )}
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="bg-indigo-100 p-6">
              <h3 className="text-xl font-bold text-slate-900">
                Order Summary
              </h3>
              <p className="text-sm text-slate-500">
                Review your tickets before booking
              </p>
            </div>
            <div className="space-y-6 p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-500">
                  Standard Pass × {quantity}
                </span>
                <span className="font-bold">{formatPrice(total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Service fee</span>
                <span className="font-bold">{formatPrice(0)}</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex items-end justify-between gap-3 py-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    Total Amount
                  </p>
                  <p className="text-3xl font-extrabold">
                    {formatPrice(total)}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  Currency: {currency}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCompletePurchase}
                disabled={processing || !isAvailable || isUnsupportedCurrency}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {processing
                    ? "Processing..."
                    : event.pricing === "FREE"
                      ? "Complete Registration"
                      : "Complete Purchase"}
                </span>
                <span>→</span>
              </button>
              {error && (
                <p role="alert" className="text-center text-sm text-red-600">
                  {error}
                </p>
              )}
              <p className="text-center text-xs leading-relaxed text-slate-500">
                By continuing, you agree to Concierge's Terms of Service and
                Privacy Policy.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
