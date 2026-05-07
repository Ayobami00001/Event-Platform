"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";

const GET_ONLINE_EVENTS = `
  query GetOnlineEvents($limit: Int) {
    getOnlineEvents(limit: $limit) {
      id
      title
      slug
      startDate
      startTime
      price
      image
    }
  }
`;

export default function OnlineEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await graphqlRequest({
          query: GET_ONLINE_EVENTS,
          variables: { limit: 3 },
        });

        setEvents(data.getOnlineEvents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="relative overflow-hidden bg-indigo-600 py-24 text-white">
      <div className="mx-auto max-w-screen-2xl px-6">
        <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="mb-6 text-5xl font-black leading-tight tracking-tight">
              Virtual Experiences,
              <br />
              Global Connection.
            </h2>

            <p className="mb-10 text-lg text-indigo-100">
              Discover workshops, webinars, and live-streamed concerts from
              anywhere in the world.
            </p>

            <button className="rounded-full bg-white px-8 py-4 text-lg font-extrabold text-indigo-600 transition hover:bg-indigo-100">
              Browse Online Events
            </button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {events.map((event: any) => (
              <div
                key={event.id}
                onClick={() => router.push(`/events/${event.slug}`)}
                className="w-80 flex-shrink-0 cursor-pointer rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl transition hover:-translate-y-1"
              >
                <div className="mb-6 h-40 overflow-hidden rounded-2xl">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <h4 className="mb-2 text-xl font-bold">{event.title}</h4>
                <p className="mb-4 text-sm text-indigo-100">
                  {new Date(event.startDate).toISOString().split("T")[0]}
                  {" • "}
                  {event.startTime || "Online Event"}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {event.price === 0 || event.price == null
                      ? "Free"
                      : `$${event.price}`}
                  </span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
