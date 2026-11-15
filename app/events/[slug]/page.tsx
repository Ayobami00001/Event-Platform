"use client";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import EventDetailsHeader from "@/components/event/EventDetailsHeader";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";
import { GET_EVENT_BY_SLUG_QUERY } from "@/graphql/queries";
import { useRouter } from "next/navigation";
import Link from "next/link";

type EventDetails = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  image?: string;
  mode: "ONLINE" | "PHYSICAL";
  pricing: "FREE" | "PAID";
  price?: number;
  currency?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  locationName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  onlineLink?: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  status: string;
  organizer: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  };
};

type GetEventBySlugResponse = {
  getEventBySlug: EventDetails | null;
};

// Event dates and times are interpreted in Nigeria time (UTC+01:00).
// Keep this rule consistent with the server-side event listing and booking checks.
function eventEndTimestamp(event: EventDetails): number | null {
  const date = event.endDate?.slice(0, 10);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(event.endTime ?? "")
    ? event.endTime
    : "23:59";
  const timestamp = Date.parse(`${date}T${time}:00+01:00`);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function eventImageUrl(value?: string): string | undefined {
  if (!value) return undefined;
  // Older records may contain a Markdown image link rather than a raw URL.
  const markdown = value.match(/^\[[^\]]+\]\((https?:\/\/[^\s)]+)/);
  return markdown?.[1] ?? value;
}

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const updateClock = () => setNow(Date.now());
    updateClock();
    const interval = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await graphqlRequest<GetEventBySlugResponse>({
          query: GET_EVENT_BY_SLUG_QUERY,
          variables: { slug },
        });

        if (!data || !data.getEventBySlug) {
          setEvent(null);
        } else {
          setEvent(data.getEventBySlug);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserRole(parsedUser?.role ?? null);
        } catch {
          setUserRole(null);
        }
      }

      fetchEvent();
    }
  }, [slug]);

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString(undefined, {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLocation = () => {
    if (!event) return "";
    if (event.mode === "ONLINE") {
      return event.onlineLink || "Online event link will be shared later";
    }
    return (
      [event.address, event.city, event.state, event.country]
        .filter(Boolean)
        .join(", ") || "Location details not available"
    );
  };

  const endTimestamp = event ? eventEndTimestamp(event) : null;
  const hasEnded = now !== null && endTimestamp !== null && now > endTimestamp;
  const isArchived =
    now !== null && endTimestamp !== null && now >= endTimestamp + 48 * 60 * 60 * 1000;
  const canBook = Boolean(
    event &&
      now !== null &&
      endTimestamp !== null &&
      !hasEnded &&
      event.availableSeats > 0 &&
      ["APPROVED", "UPCOMING", "ONGOING"].includes(event.status)
  );
  const formattedPrice =
    event?.pricing === "FREE"
      ? "Free"
      : new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: event?.currency || "NGN",
        }).format(event?.price ?? 0);

  if (loading) {
    return (
      <main className="bg-slate-50 text-slate-900 min-h-screen">
        <Navbar />
        <div className="mt-24 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading event...
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !event || isArchived) {
    return (
      <main className="bg-slate-50 text-slate-900 min-h-screen">
        <Navbar />
        <div className="mt-24 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-red-600 shadow-sm">
            {isArchived ? "This event has ended and is no longer publicly available." : error || "Event not found"}
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-slate-50 text-slate-900">
      <Navbar />

      <div className="mt-20">
        <div className="relative">
          <EventDetailsHeader event={event} />
          {hasEnded && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-6">
              <div className="rounded-xl bg-red-700 px-6 py-3 text-center text-lg font-extrabold tracking-widest text-white shadow-xl">
                EVENT ENDED
              </div>
            </div>
          )}
        </div>

        <section className="relative z-10 mx-auto -mt-15 grid max-w-7xl grid-cols-1 gap-12 px-6 pb-24 lg:grid-cols-12 lg:px-8">
          <div className="space-y-12 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-lg font-bold text-indigo-600 ring-2 ring-indigo-100">
                  {event.organizer?.avatar ? (
                    <img
                      src={event.organizer.avatar}
                      alt={event.organizer.fullName || "Organizer"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    event.organizer?.fullName?.charAt(0)?.toUpperCase() || "O"
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Organized by
                  </p>
                  <Link
                    href={`/organizer/${event.organizer.id}`}
                    className="text-xl font-bold text-slate-900 hover:text-indigo-600 hover:underline"
                  >
                    {event.organizer.fullName}
                  </Link>
                </div>
              </div>

              <Link
                href={`/organizer/${event.organizer.id}`}
                className="rounded-full border-2 border-indigo-600 px-6 py-2.5 font-bold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
              >
                View & Follow Organizer
              </Link>
            </div>

            <div className="space-y-8 rounded-3xl bg-slate-100/60 p-4">
              <div className="max-w-none leading-relaxed text-slate-600">
                <h2 className="mb-6 text-3xl font-bold text-slate-900">
                  About the Event
                </h2>

                <p className="whitespace-pre-line">{event.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <h4 className="mb-2 text-lg font-bold">Category</h4>
                  <p className="text-sm text-slate-500">{event.category}</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <h4 className="mb-2 text-lg font-bold">Event Mode</h4>
                  <p className="text-sm text-slate-500">{event.mode}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-3xl bg-indigo-50 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {event.availableSeats}
                </div>

                <p className="font-medium text-indigo-900">
                  {event.availableSeats > 0
                    ? `${event.availableSeats} seat${
                        event.availableSeats > 1 ? "s" : ""
                      } still available`
                    : "This event is sold out"}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Location</h2>
                {event.mode === "PHYSICAL" && (
                  <button className="font-bold text-indigo-600">
                    Get Directions
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-slate-100 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <span className="text-3xl text-indigo-600">
                    {event.mode === "ONLINE" ? "💻" : "📍"}
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-bold">
                    {event.mode === "ONLINE"
                      ? "Online Event"
                      : event.locationName || "Venue not set"}
                  </h4>
                  <p className="text-slate-500">{formatLocation()}</p>
                </div>
              </div>

              <div className="relative h-[400px] overflow-hidden rounded-3xl border border-slate-200">
                {eventImageUrl(event.image) ? (
                  <img
                    src={eventImageUrl(event.image)}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                    No event image available
                  </div>
                )}
                {hasEnded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/65">
                    <span className="rounded-xl bg-red-700 px-6 py-3 text-xl font-extrabold tracking-widest text-white">
                      EVENT ENDED
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 font-medium text-slate-500">
                    Single Entry Ticket
                  </p>
                  <h2 className="text-4xl font-black">
                    {formattedPrice}
                  </h2>
                </div>

                <span className="rounded-md bg-red-100 px-3 py-1 text-xs font-bold tracking-tight text-red-700">
                  {event.availableSeats} LEFT
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Availability
                  </p>
                  <p className="text-sm font-semibold">
                    {event.availableSeats > 0
                      ? `${event.availableSeats} of ${event.totalSeats} seats available`
                      : "Sold out"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Date & Time
                  </p>
                  <p className="text-sm font-semibold">
                    {formatDate(event.startDate)}
                    {event.startTime ? ` • ${event.startTime}` : ""}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Refund Policy
                  </p>
                  <p className="text-sm font-semibold">Contact the organizer for refund terms</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (!canBook) return;
                    if (userRole === "ORGANIZER" || userRole === "ADMIN") {
                      alert("Only users can book events.");
                      return;
                    }

                    router.push(`/checkout/${event.id}`);
                  }}
                  disabled={!canBook}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-5 text-lg font-bold text-white transition ${
                    canBook
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "cursor-not-allowed bg-slate-400"
                  }`}
                >
                  {hasEnded
                    ? "Event Ended"
                    : event.availableSeats <= 0
                    ? "Sold Out"
                    : event.pricing === "FREE"
                      ? "Register for Free"
                      : "Buy Ticket"}
                </button>

                <button className="w-full rounded-2xl bg-slate-200 py-5 font-bold text-slate-800 transition hover:bg-slate-300">
                  Contact Host
                </button>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-500">
                    Share with friends
                  </p>

                  <div className="flex gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-indigo-600">
                      ↗
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-indigo-600">
                      ♥
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
