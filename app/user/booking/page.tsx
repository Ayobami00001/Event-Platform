"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { graphqlRequest } from "@/lib/graphqlClient";
import { QRCodeSVG } from "qrcode.react";

type Booking = {
  id: string;
  quantity: number;
  totalPrice: number;
  bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
  tickets: { id: string; ticketCode: string; issuedAt: string }[];
  event: {
    id: string;
    title: string;
    slug?: string | null;
    image?: string | null;
    category?: string | null;
    startDate: string;
    endDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    mode: "ONLINE" | "PHYSICAL";
    locationName?: string | null;
    city?: string | null;
    state?: string | null;
    pricing: "FREE" | "PAID";
  } | null;
};

type Tab = "upcoming" | "past" | "cancelled";
type SortBy = "soonest" | "latest" | "price";

const GET_MY_BOOKINGS = `
  query GetMyBookings {
    getMyBookings {
      id
      quantity
      totalPrice
      bookingStatus
      paymentStatus
      tickets {
        id
        ticketCode
        issuedAt
      }
      event {
        id
        title
        slug
        image
        category
        startDate
        endDate
        startTime
        endTime
        mode
        locationName
        city
        state
        pricing
      }
    }
  }
`;

const money = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value);

function dateTime(value?: string | null, time?: string | null) {
  if (!value) return null;
  const date = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const clock = time && /^\d{2}:\d{2}$/.test(time) ? time : "00:00";
  const timestamp = Date.parse(`${date}T${clock}:00+01:00`);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function ended(booking: Booking, now: number) {
  const event = booking.event;
  if (!event) return true;
  const end = dateTime(event.endDate || event.startDate, event.endTime || "23:59");
  return end !== null && end < now;
}

function eventDate(value?: string | null) {
  if (!value) return "Date unavailable";
  const epoch = dateTime(value);
  return epoch === null
    ? value
    : new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(epoch);
}

function eventTime(value?: string | null) {
  if (!value) return "Time to be announced";
  return value;
}

function venue(event: NonNullable<Booking["event"]>) {
  if (event.mode === "ONLINE") return "Online event";
  return [event.locationName, event.city, event.state].filter(Boolean).join(", ") || "Venue to be announced";
}

function imageUrl(value?: string | null) {
  if (!value) return null;
  const markdownUrl = value.match(/^\[https?:\/\/[^\]]+\]\((https?:\/\/[^\s)]+)/);
  const candidate = markdownUrl?.[1] || value.trim();
  return /^https?:\/\//.test(candidate) ? candidate : null;
}

function StatusPill({ booking }: { booking: Booking }) {
  const isConfirmed = booking.bookingStatus === "CONFIRMED";
  const cancelled = booking.bookingStatus === "CANCELLED";
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
        isConfirmed
          ? "bg-emerald-100 text-emerald-800"
          : cancelled
            ? "bg-red-100 text-red-700"
            : "bg-amber-100 text-amber-800"
      }`}
    >
      {booking.bookingStatus === "PENDING" ? "Awaiting payment" : booking.bookingStatus.toLowerCase()}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#e9e9f1] bg-white p-5 shadow-sm">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{value}</p>
        <p className="mt-1 text-[11px] text-indigo-700">{hint}</p>
      </div>
      <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
        {icon}
      </div>
    </div>
  );
}

export default function UserBookingsPage() {
  const router = useRouter();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("upcoming");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("soonest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewingTicket, setViewingTicket] = useState<{ booking: Booking; index: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setPaymentSuccess(new URLSearchParams(window.location.search).get("payment") === "success");
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        const data = await graphqlRequest<{ getMyBookings: Booking[] }>({
          query: GET_MY_BOOKINGS,
          token,
        });
        if (!cancelled) setBookings(data.getMyBookings ?? []);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Unable to load bookings.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const upcoming = useMemo(
    () => bookings.filter((booking) => booking.bookingStatus !== "CANCELLED" && booking.paymentStatus !== "REFUNDED" && !ended(booking, now)),
    [bookings, now],
  );
  const past = useMemo(
    () => bookings.filter((booking) => booking.bookingStatus !== "CANCELLED" && booking.paymentStatus !== "REFUNDED" && ended(booking, now)),
    [bookings, now],
  );
  const cancelled = useMemo(
    () => bookings.filter((booking) => booking.bookingStatus === "CANCELLED" || booking.paymentStatus === "REFUNDED"),
    [bookings],
  );
  const confirmed = bookings.filter((booking) => booking.bookingStatus === "CONFIRMED");
  const totalSpent = bookings.reduce(
    (sum, booking) => sum + (booking.paymentStatus === "PAID" && booking.event?.pricing === "PAID" ? booking.totalPrice : 0),
    0,
  );
  const categories = Array.from(new Set(bookings.map((booking) => booking.event?.category).filter((value): value is string => Boolean(value)))).sort();

  const visible = useMemo(() => {
    const source = tab === "upcoming" ? upcoming : tab === "past" ? past : cancelled;
    const term = search.trim().toLowerCase();
    return source
      .filter((booking) => {
        const matchesSearch = !term || `${booking.id} ${booking.event?.title ?? ""}`.toLowerCase().includes(term);
        const matchesCategory = category === "all" || booking.event?.category === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price") return b.totalPrice - a.totalPrice;
        const aDate = dateTime(a.event?.startDate) ?? 0;
        const bDate = dateTime(b.event?.startDate) ?? 0;
        return sortBy === "latest" ? bDate - aDate : aDate - bDate;
      });
  }, [tab, upcoming, past, cancelled, search, category, sortBy]);

  const featured = upcoming
    .filter((booking) => booking.bookingStatus === "CONFIRMED" && booking.event)
    .sort((a, b) => (dateTime(a.event?.startDate) ?? Infinity) - (dateTime(b.event?.startDate) ?? Infinity))[0];

  useEffect(() => {
    if (!viewingTicket) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewingTicket(null);
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [viewingTicket]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fb] text-[#191c1e]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#d0e1fb] px-3 py-1 text-xs font-bold text-[#38485d]">
              <span className="h-2 w-2 rounded-full bg-[#392cc1]" /> Attendee Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">My Bookings</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Access your event passes, booking details and reservation history.
            </p>
          </div>
          <Link href="/events" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#392cc1] to-[#534ad9] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90">
            <span aria-hidden="true">＋</span> Explore More Events
          </Link>
        </div>

        {paymentSuccess && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800" role="status">
            Payment verified and booking confirmed. Your reservation is listed below.
          </div>
        )}

        {error && <p role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <SummaryCard label="Upcoming Passes" value={String(upcoming.filter((b) => b.bookingStatus === "CONFIRMED").length)} hint="Confirmed upcoming bookings" icon="🎟️" />
          <SummaryCard label="Past Experiences" value={String(past.length)} hint="Your booking history" icon="🗓️" />
          <SummaryCard label="Total Invested" value={money(totalSpent)} hint="Paid bookings (NGN)" icon="💳" />
          <SummaryCard label="Confirmed Bookings" value={String(confirmed.length)} hint="Paid and free registrations" icon="✅" />
        </div>

        <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl bg-[#f0f2f6] p-2 lg:flex-row lg:items-center">
          <div className="flex items-center gap-1 overflow-x-auto">
            {([
              ["upcoming", "Upcoming", upcoming.length],
              ["past", "Past Events", past.length],
              ["cancelled", "Cancelled / Refunded", cancelled.length],
            ] as const).map(([key, label, count]) => (
              <button key={key} type="button" onClick={() => { setTab(key); setExpandedId(null); }}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition ${tab === key ? "bg-[#392cc1] text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}>
                {label} <span className={`ml-1.5 rounded-full px-2 py-0.5 ${tab === key ? "bg-white/20" : "bg-white"}`}>{count}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input aria-label="Search by event name or booking reference" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search event or booking #" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none focus:border-indigo-500 sm:w-52" />
            <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-xs">
              <option value="all">All Categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select aria-label="Sort bookings" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-xs">
              <option value="soonest">Date: Earliest</option>
              <option value="latest">Date: Latest</option>
              <option value="price">Highest Price</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-7 lg:col-span-8">
            {tab === "upcoming" && featured && (
              <section className="overflow-hidden rounded-[2rem] border border-[#e2e1ef] bg-white shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-5 bg-gradient-to-r from-[#392cc1] to-[#534ad9] p-6 text-white md:p-8">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Next Upcoming Event</span>
                      <span className="rounded-full bg-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-900">CONFIRMED</span>
                    </div>
                    <h2 className="text-2xl font-extrabold md:text-3xl">{featured.event?.title}</h2>
                    <p className="mt-2 text-sm text-white/80">{featured.event?.mode === "ONLINE" ? "Online access" : "In-person admission"} • {featured.quantity} {featured.quantity === 1 ? "pass" : "passes"}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs uppercase tracking-widest text-white/70">Booking Ref</p>
                    <p className="mt-1 break-all font-mono text-sm font-bold">#{featured.id.slice(-10).toUpperCase()}</p>
                  </div>
                </div>
                <div className="grid gap-0 md:grid-cols-12">
                  <div className="space-y-5 p-6 md:col-span-7 md:p-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f2f4f6] p-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#392cc1]">📅 Date & Time</p>
                        <p className="text-sm font-bold">{eventDate(featured.event?.startDate)}</p>
                        <p className="mt-1 text-xs text-slate-600">{eventTime(featured.event?.startTime)} (Nigeria time)</p>
                      </div>
                      <div className="rounded-2xl bg-[#f2f4f6] p-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#392cc1]">📍 Venue</p>
                        <p className="text-sm font-bold">{featured.event ? venue(featured.event) : "Unavailable"}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-indigo-100 bg-[#f7f7fc] p-4">
                      <p className="text-sm font-bold text-indigo-900">✓ Your reservation is confirmed</p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{featured.quantity} {featured.quantity === 1 ? "seat has" : "seats have"} been booked. Your digital passes are linked to this booking. Open a ticket to display its unique check-in QR code.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {featured.tickets?.length > 0 && (
                        <button type="button" onClick={() => setViewingTicket({ booking: featured, index: 0 })} className="rounded-xl bg-[#392cc1] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#5148d7]">View Ticket & QR</button>
                      )}
                      <button type="button" onClick={() => setExpandedId(expandedId === featured.id ? null : featured.id)} className="rounded-xl bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100">View Booking Details</button>
                    </div>
                    {expandedId === featured.id && <BookingDetails booking={featured} />}
                  </div>
                  <div className="flex flex-col items-center justify-center border-t border-dashed border-[#d6d4e5] bg-[#f2f4f6] p-6 text-center md:col-span-5 md:border-l md:border-t-0 md:p-8">
                    <span className="mb-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">✓ Ready for your event</span>
                    <div className="flex h-44 w-44 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      {featured.tickets?.[0] ? (
                        <button type="button" onClick={() => setViewingTicket({ booking: featured, index: 0 })} aria-label="Open ticket QR code" className="flex flex-col items-center gap-2">
                          <QRCodeSVG value={featured.tickets[0].ticketCode} size={124} marginSize={1} />
                          <span className="text-[10px] font-semibold text-indigo-700">Tap to view ticket</span>
                        </button>
                      ) : (
                        <><span className="text-5xl" aria-hidden="true">🎫</span><span className="mt-2 text-xs font-semibold text-slate-600">Ticket not issued</span></>
                      )}
                    </div>
                    <p className="mt-4 break-all font-mono text-[11px] font-bold text-slate-500">#{featured.id}</p>
                    <p className="mt-2 text-xs text-slate-500">{featured.event?.pricing === "FREE" ? "Free registration" : money(featured.totalPrice)}</p>
                  </div>
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-bold tracking-tight">{tab === "upcoming" ? "Upcoming Experiences" : tab === "past" ? "Past Experiences" : "Cancelled & Refunded"}</h3>
                <span className="text-xs text-slate-500">Showing {visible.length} of {tab === "upcoming" ? upcoming.length : tab === "past" ? past.length : cancelled.length} bookings</span>
              </div>
              {loading ? (
                <div className="rounded-3xl bg-white p-10 text-center text-sm text-slate-500">Loading your bookings...</div>
              ) : !error && visible.length === 0 ? (
                <div className="rounded-3xl border border-[#e9e9f1] bg-white p-10 text-center">
                  <div className="text-4xl">🎟️</div>
                  <h3 className="mt-3 text-lg font-bold">No bookings to show</h3>
                  <p className="mt-2 text-sm text-slate-500">{search || category !== "all" ? "Try clearing your search or filters." : "Bookings in this category will appear here."}</p>
                  <Link href="/events" className="mt-5 inline-flex rounded-full bg-[#392cc1] px-5 py-3 text-sm font-bold text-white">Explore Events</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {visible.map((booking) => (
                    <article key={booking.id} className="rounded-3xl border border-[#e9e9f1] bg-white p-5 shadow-sm transition hover:shadow-md md:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-5 md:flex-nowrap">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          {imageUrl(booking.event?.image) ? (
                            // Images originate from organizer-provided URLs (Cloudinary in the current app).
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imageUrl(booking.event?.image) || ""} alt={booking.event?.title || "Event"} className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200" />
                          ) : (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">🎫</div>
                          )}
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <StatusPill booking={booking} />
                              <span className="break-all font-mono text-[10px] text-slate-500">#{booking.id.slice(-10).toUpperCase()}</span>
                            </div>
                            <h4 className="text-base font-extrabold tracking-tight text-slate-900 md:text-lg">{booking.event?.title ?? "Event unavailable"}</h4>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
                              <span>📅 {eventDate(booking.event?.startDate)}{booking.event?.startTime ? ` • ${booking.event.startTime}` : ""}</span>
                              <span>📍 {booking.event ? venue(booking.event) : "Unavailable"}</span>
                              <span>🎟️ {booking.quantity} {booking.quantity === 1 ? "Ticket" : "Tickets"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full shrink-0 flex-wrap gap-2 md:w-auto">
                          {booking.bookingStatus === "CONFIRMED" && booking.tickets?.length > 0 && (
                            <button type="button" onClick={() => setViewingTicket({ booking, index: 0 })} className="rounded-xl bg-[#392cc1] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#5148d7]">View Ticket ({booking.tickets.length})</button>
                          )}
                          <button type="button" onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)} className="rounded-xl bg-[#eceef0] px-4 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-[#e0e3e5]">{expandedId === booking.id ? "Hide Details" : "View Details"}</button>
                          {booking.event?.slug && <Link href={`/events/${booking.event.slug}`} className="rounded-xl border border-indigo-200 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50">View Event</Link>}
                        </div>
                      </div>
                      {expandedId === booking.id && <div className="mt-5 border-t border-slate-100 pt-5"><BookingDetails booking={booking} /></div>}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-[#e9e9f1] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">🎧</span>
                <div><h3 className="font-bold">Concierge Assistance</h3><p className="text-xs text-slate-500">Help with your event bookings</p></div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-slate-600">Need help with a reservation, payment confirmation or an event? Open the booking details and keep your reference handy when contacting support.</p>
              <Link href="/events" className="mt-5 flex items-center justify-between rounded-2xl bg-[#f2f4f6] p-4 text-sm font-semibold text-slate-800 hover:bg-[#e9eaf1]">
                Explore other events <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-[#eeedf8] p-6">
              <div className="flex items-center gap-2 text-indigo-800"><span className="text-xl">🛡️</span><h3 className="font-bold">Your tickets & security</h3></div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">Your bookings are linked to your account. Only bookings confirmed by the server should be treated as valid admission passes.</p>
            </div>
            <div className="rounded-3xl border border-[#e9e9f1] bg-white p-6 shadow-sm">
              <h3 className="font-bold">Payment & Billing</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">Your paid and free registrations are shown in your booking history. Payment status is displayed for every booking.</p>
              <div className="mt-4 rounded-2xl bg-[#f2f4f6] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Paid bookings total</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{money(totalSpent)}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      {viewingTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setViewingTicket(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="ticket-dialog-title" className="w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8" style={{ maxHeight: "90vh" }}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Concierge digital pass</p>
                <h2 id="ticket-dialog-title" className="mt-1 text-xl font-extrabold text-slate-900">{viewingTicket.booking.event?.title || "Event ticket"}</h2>
              </div>
              <button type="button" onClick={() => setViewingTicket(null)} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" aria-label="Close ticket viewer">✕</button>
            </div>
            <p className="text-sm text-slate-600">{eventDate(viewingTicket.booking.event?.startDate)} · {eventTime(viewingTicket.booking.event?.startTime)}</p>
            <p className="mt-1 text-sm text-slate-600">{viewingTicket.booking.event ? venue(viewingTicket.booking.event) : "Venue unavailable"}</p>
            <div className="my-6 flex flex-col items-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-6">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <QRCodeSVG value={viewingTicket.booking.tickets[viewingTicket.index].ticketCode} size={210} marginSize={1} />
              </div>
              <p className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Ticket {viewingTicket.index + 1} of {viewingTicket.booking.tickets.length}</p>
              <p className="mt-2 break-all text-center font-mono text-sm font-semibold text-slate-900">{viewingTicket.booking.tickets[viewingTicket.index].ticketCode}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button type="button" disabled={viewingTicket.index === 0} onClick={() => setViewingTicket((current) => current && { ...current, index: current.index - 1 })} className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-800 disabled:opacity-40">← Previous</button>
              <button type="button" disabled={viewingTicket.index >= viewingTicket.booking.tickets.length - 1} onClick={() => setViewingTicket((current) => current && { ...current, index: current.index + 1 })} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-40">Next →</button>
            </div>
            <p className="mt-5 text-center text-xs text-slate-500">Present this code at entry. A server-side check-in system must validate it before admission.</p>
          </section>
        </div>
      )}
    </div>
  );
}

function BookingDetails({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-2xl bg-[#f7f7fc] p-4 text-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div><p className="text-xs text-slate-500">Booking reference</p><p className="break-all font-mono font-semibold">{booking.id}</p></div>
        <div><p className="text-xs text-slate-500">Payment status</p><p className="font-semibold">{booking.paymentStatus}</p></div>
        <div><p className="text-xs text-slate-500">Tickets booked</p><p className="font-semibold">{booking.quantity}</p></div>
        <div><p className="text-xs text-slate-500">Amount</p><p className="font-semibold">{booking.event?.pricing === "FREE" ? "Free" : money(booking.totalPrice)}</p></div>
      </div>
      {booking.bookingStatus === "CONFIRMED" ? (
        <p className="mt-4 rounded-xl border border-indigo-100 bg-white p-3 text-xs text-indigo-900">Your booking is confirmed. Your issued ticket codes will appear when you select View Ticket. If you cannot see that button, tickets have not been issued for this booking yet.</p>
      ) : (
        <p className="mt-4 rounded-xl border border-amber-100 bg-white p-3 text-xs text-amber-900">This booking is not confirmed. Check the payment status before attempting another payment.</p>
      )}
    </div>
  );
}
