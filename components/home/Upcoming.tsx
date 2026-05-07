"use client";

import { useEffect, useState } from "react";
import { graphqlRequest } from "@/lib/graphqlClient";
import { useRouter } from "next/navigation";

const GET_UPCOMING_EVENTS = `
query GetUpcomingEvents($limit: Int) {
  getUpcomingEvents(limit: $limit) {
    id
    title
    slug
    category
    startDate
    startTime
    locationName
    price
    image
  }
}
`;

export default function Upcoming() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const fetchEvents = async () => {
      try {
        const data = await graphqlRequest({
          query: GET_UPCOMING_EVENTS,
          variables: { limit: 6 },
        });

        setEvents(data.getUpcomingEvents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
  if (!mounted) return null;

  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-24">
      <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Upcoming <span className="text-indigo-600">Experiences</span>
          </h2>
          <p className="mt-2 font-medium text-slate-500">
            Plan your next adventure. Browse by date, category, or location.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="rounded-full bg-white px-5 py-2 text-sm font-bold shadow-sm">
            Filter
          </button>
          <button className="rounded-full bg-white px-5 py-2 text-sm font-bold shadow-sm">
            Sort
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <p className="text-center py-10">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-center py-10 text-slate-500">
            No upcoming events available.
          </p>
        ) : (
          events.map((event: any) => (
            <div
              key={event.id}
              className="group flex flex-col gap-8 rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg md:flex-row"
            >
              <div className="h-48 w-full overflow-hidden rounded-2xl md:w-72">
                <img
                  src={event.image || "/placeholder.jpg"}
                  alt={event.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex-grow py-2">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
                      {event.category}
                    </span>
                    <h3 className="mt-1 text-2xl font-extrabold">
                      {event.title}
                    </h3>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 text-sm text-slate-500 lg:grid-cols-4">
                  <div>
                    {new Date(event.startDate).toISOString().split("T")[0]}
                  </div>
                  <div>{event.startTime || "—"}</div>
                  <div>{event.locationName || "Online"}</div>
                  <div>
                    {event.price === 0 || event.price === null
                      ? "Free"
                      : `$${event.price}`}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => router.push(`/events/${event.slug}`)} className="rounded-full bg-indigo-600 px-6 py-2 font-bold text-white transition hover:bg-indigo-700">
                    {event.price === 0 ? "RSVP" : "Book Tickets"}
                  </button>
                  
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
