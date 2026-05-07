"use client";

import { useEffect, useState } from "react";
import { graphqlRequest } from "@/lib/graphqlClient";

const GET_TODAY_EVENTS = `
  query GetTodayEvents($limit: Int) {
    getTodayEvents(limit: $limit) {
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

export default function TodayEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const fetchEvents = async () => {
      try {
        const data = await graphqlRequest({
          query: GET_TODAY_EVENTS,
          variables: { limit: 4 },
        });

        setEvents(data.getTodayEvents);
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
    <section className="mt-12 bg-slate-100 py-20">
      <div className="mx-auto max-w-screen-2xl px-6">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Happening <span className="text-indigo-600">Today</span>
          </h2>
          <p className="mt-2 font-medium text-slate-500">
            Don&apos;t miss out. Last-minute tickets available.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <p className="col-span-full text-center py-10">
              Loading today events...
            </p>
          ) : events.length === 0 ? (
            <p className="col-span-full text-center py-10 text-slate-500">
              No events today.
            </p>
          ) : (
            events.map((event: any) => (
              // event card
              <div
                key={event.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={event.image || "/placeholder.jpg"}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <h4 className="mb-1 text-lg font-bold">{event.title}</h4>
                  <p className="mb-4 text-sm text-slate-500">
                    {event.startTime || "Today"}
                  </p>

                  <p className="mb-4 text-sm text-slate-500">
                    {new Date(event.startDate).toLocaleDateString()} •{" "}
                    {event.startTime || "Today"}
                  </p>

                  <p className="mb-4 text-sm text-slate-500">
                    {event.locationName || "Online Event"}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600">
                      {event.price === 0 || event.price == null
                        ? "Free"
                        : `$${event.price}`}
                    </span>
                    <button className="text-sm font-bold text-indigo-600 hover:underline">
                      {event.price === 0 ? "RSVP" : "Get Tickets"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
