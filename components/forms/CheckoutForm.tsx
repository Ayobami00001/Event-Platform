"use client";

import { useState } from "react";

export default function CheckoutForm() {
  const [quantity, setQuantity] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const ticketPrice = 125;
  const serviceFee = 12.5;
  const tax = 20;

  const subtotal = ticketPrice * quantity;
  const total = subtotal + serviceFee + tax;

  const decreaseQty = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const increaseQty = () => {
    setQuantity((prev) => prev + 1);
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-32 md:px-12">
      <header className="mb-12">
        <div className="flex flex-col items-start gap-8 md:flex-row">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-200 shadow-lg md:w-1/3">
            <img
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80"
              alt="Event Banner"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              Trending Event
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Midnight Pulse: Electronic Arts Festival
            </h1>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <span className="text-indigo-600">📅</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Date</p>
                  <p className="font-bold">Oct 24, 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <span className="text-indigo-600">⏰</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Time</p>
                  <p className="font-bold">09:00 PM - 04:00 AM</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm sm:col-span-2">
                <span className="text-indigo-600">📍</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Location</p>
                  <p className="font-bold">
                    The Grand Atrium, San Francisco CA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Select Tickets</h2>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
                General Admission
              </span>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-3xl bg-slate-100 p-6 md:flex-row md:items-center">
              <div className="space-y-1">
                <p className="text-lg font-bold">Standard Pass</p>
                <p className="text-sm text-slate-500">
                  Includes full venue access and priority entry.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <p className="text-xl font-extrabold text-indigo-700">
                  ${ticketPrice.toFixed(2)}
                </p>

                <div className="flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={decreaseQty}
                    className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-indigo-600 transition hover:bg-slate-100"
                  >
                    −
                  </button>

                  <span className="w-12 text-center text-lg font-bold">
                    {String(quantity).padStart(2, "0")}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQty}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white transition hover:bg-indigo-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="mb-8 text-2xl font-bold">Payment Information</h2>

            <div className="mb-10 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`rounded-full px-6 py-3 font-bold transition ${
                  paymentMethod === "card"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                Credit Card
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("crypto")}
                className={`rounded-full px-6 py-3 font-bold transition ${
                  paymentMethod === "crypto"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                Crypto
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className={`rounded-full px-6 py-3 font-bold transition ${
                  paymentMethod === "wallet"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                Pay with Wallet
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-500">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="Johnathan Doe"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-500">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-500">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-500">
                  CVV
                </label>
                <input
                  type="password"
                  placeholder="***"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-8 flex items-start gap-4 rounded-2xl bg-indigo-50 p-4">
              <span className="text-indigo-600">🔒</span>
              <p className="text-xs leading-relaxed text-slate-600">
                Your payment details are encrypted using bank-grade security and
                processed by an authorized PCI-compliant provider. We never
                store your card number.
              </p>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="bg-indigo-100 p-6">
              <h3 className="text-xl font-bold text-slate-900">Order Summary</h3>
              <p className="text-sm text-slate-500">Booking #CNCG-98421</p>
            </div>

            <div className="space-y-6 p-8">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">
                  Standard Pass x {quantity}
                </span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Service Fee</span>
                <span className="font-bold">${serviceFee.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Tax (8%)</span>
                <span className="font-bold">${tax.toFixed(2)}</span>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex items-end justify-between py-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    Total Amount
                  </p>
                  <p className="text-3xl font-extrabold">${total.toFixed(2)}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500">Currency: USD</span>
                </div>
              </div>

              <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition hover:scale-[1.02] hover:bg-indigo-700 active:scale-95">
                <span>Complete Purchase</span>
                <span>→</span>
              </button>

              <p className="text-center text-[10px] text-slate-500">
                By clicking &apos;Complete Purchase&apos; you agree to the
                Concierge <a href="#" className="underline">Terms of Service</a>{" "}
                and <a href="#" className="underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}