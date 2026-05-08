"use client";

import { useEffect, useState } from "react";
import { graphqlRequest } from "@/lib/graphqlClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GET_TRENDING_EVENTS = `
  query {
    getEvents {
      id
      title
      slug
      category
      startDate
      startTime
      locationName
      price
      image
      isFeatured
    }
  }
`;

export default function Trending() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data: any = await graphqlRequest({
          query: GET_TRENDING_EVENTS,
        });

        // 👇 filter featured OR fallback to first 3
        const featured = data.getEvents.filter((e: any) => e.isFeatured);

        setEvents(
          featured.length > 0
            ? featured.slice(0, 3)
            : data.getEvents.slice(0, 3),
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <p className="text-center py-10">Loading trending events...</p>;
  }

  if (!events.length) return null;

  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-12">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Trending <span className="text-indigo-600">Now</span>
          </h2>
          <p className="mt-2 font-medium text-slate-500">
            Experiences everyone is talking about.
          </p>
        </div>

        <Link
          href="/events"
          className="font-bold text-indigo-600 hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div
          onClick={() => router.push(`/events/${events[0].slug}`)}
          className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow transition hover:shadow-xl lg:col-span-8"
        >
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={events[0].image}
              alt={events[0].title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>

          <div className="p-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              {events[0].category}
            </p>
            <h3 className="mb-4 text-3xl font-extrabold">{events[0].title}</h3>

            <div className="flex flex-wrap gap-6 text-slate-500">
              <span>
                {new Date(events[0].startDate).toISOString().split("T")[0]}
              </span>

              <span>{events[0].startTime || "Time TBA"}</span>

              <span>{events[0].locationName || "Online Event"}</span>
            </div>

            <p className="mt-6 text-2xl font-black text-indigo-600">
              {events[0].price === 0 || events[0].price == null
                ? "Free"
                : `$${events[0].price}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:col-span-4">
          {events.slice(1).map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/events/${event.slug}`)}
              className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-xl"
            >
              <div className="h-52 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-6">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                  {event.category}
                </p>
                <h3 className="mb-3 text-xl font-bold">{event.title}</h3>
                <p className="mb-2 text-sm text-slate-500">
                  {new Date(event.startDate).toISOString().split("T")[0]}
                </p>

                <p className="mb-3 text-sm text-slate-500">
                  {event.locationName || "Online Event"}
                </p>

                <p className="text-lg font-bold text-indigo-600">
                  {event.price === 0 || event.price == null
                    ? "Free"
                    : `$${event.price}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
