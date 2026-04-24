"use client";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import EventDetailsHeader from "@/components/event/EventDetailsHeader";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";
import { GET_EVENT_BY_SLUG_QUERY } from "@/graphql/queries";

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
  };
};

type GetEventBySlugResponse = {
  getEventBySlug: EventDetails | null;
};

export default function EventDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await graphqlRequest<GetEventBySlugResponse>({
          query: GET_EVENT_BY_SLUG_QUERY,
          variables: { slug },
        });

        setEvent(data.getEventBySlug || null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
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

  if (error || !event) {
    return (
      <main className="bg-slate-50 text-slate-900 min-h-screen">
        <Navbar />
        <div className="mt-24 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-red-600 shadow-sm">
            {error || "Event not found"}
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
        <EventDetailsHeader event={event} />

        <section className="relative z-10 mx-auto -mt-20 grid max-w-7xl grid-cols-1 gap-12 px-6 pb-24 lg:grid-cols-12 lg:px-8">
          <div className="space-y-12 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600 ring-2 ring-indigo-100">
                  {event.organizer?.fullName?.charAt(0)?.toUpperCase() || "O"}
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Organized by
                  </p>
                  <h3 className="text-xl font-bold">
                    {event.organizer?.fullName || "Unknown Organizer"}
                  </h3>
                </div>
              </div>

              <button className="rounded-full border-2 border-indigo-600 px-6 py-2.5 font-bold text-indigo-600 transition hover:bg-indigo-600 hover:text-white">
                Follow Organizer
              </button>
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

              <div className="h-[400px] overflow-hidden rounded-3xl border border-slate-200">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                    No event image available
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
                    {event.pricing === "FREE"
                      ? "Free"
                      : `${event.currency || "$"}${event.price || 0}`}
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
                  <p className="text-sm font-semibold">
                    Full refund 48h prior
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`/checkout/${event.id}`}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-5 text-lg font-bold text-white transition ${
                    event.availableSeats > 0
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "cursor-not-allowed bg-slate-400 pointer-events-none"
                  }`}
                >
                  {event.availableSeats > 0 ? "Buy Ticket" : "Sold Out"}
                </a>

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