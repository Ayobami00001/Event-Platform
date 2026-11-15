"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";

const VERIFY_PAYMENT = `
  mutation VerifyPayment($reference: String!) {
    verifyPayment(reference: $reference) {
      id
      bookingStatus
      paymentStatus
    }
  }
`;

export default function PaymentSuccessPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const reference =
          params.get("reference") || params.get("trxref");

        if (!reference) {
          throw new Error("Payment reference is missing.");
        }

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Please log in to the account used for this booking.",
          );
        }

        const result = await graphqlRequest<{
          verifyPayment: {
            id: string;
            bookingStatus: string;
            paymentStatus: string;
          };
        }>({
          query: VERIFY_PAYMENT,
          variables: { reference },
          token,
        });

        const booking = result.verifyPayment;

        if (
          booking.bookingStatus !== "CONFIRMED" ||
          booking.paymentStatus !== "PAID"
        ) {
          throw new Error("Payment is not confirmed yet.");
        }

        if (!cancelled) {
          router.replace("/user/booking?payment=success");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to verify payment.",
          );
        }
      } finally {
        if (!cancelled) {
          setVerifying(false);
        }
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const returnToCheckout = () => {
    const eventId = sessionStorage.getItem("pendingCheckoutEventId");

    if (eventId) {
      router.push(`/checkout/${eventId}`);
    } else {
      router.push("/events");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
        {verifying ? (
          <>
            <h1 className="text-2xl font-bold">
              Verifying Your Payment
            </h1>
            <p className="mt-3 text-slate-600">
              Checking your transaction with Paystack...
            </p>
          </>
        ) : error ? (
          <>
            <h1 className="text-2xl font-bold text-red-600">
              Payment Not Confirmed
            </h1>

            <p className="mt-3 text-slate-600">{error}</p>

            <p className="mt-3 text-sm text-slate-500">
              If you were charged, do not pay again until the
              transaction has been checked.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white"
            >
              Retry Verification
            </button>

            <button
              type="button"
              onClick={returnToCheckout}
              className="mt-3 w-full rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-800"
            >
              Back to Checkout
            </button>
          </>
        ) : null}
      </section>
    </main>
  );
}