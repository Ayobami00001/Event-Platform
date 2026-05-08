"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter , useSearchParams } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import EventCard from "@/components/event/EventCard";
import EventFilters from "@/components/event/EventFilters";
import { graphqlRequest } from "@/lib/graphqlClient";

const GET_EVENTS = `
  query GetEvents(
    $search: String
    $category: String
    $location: String
    $date: String
    $price: String
  ) {
    getEvents(
      search: $search
      category: $category
      location: $location
      date: $date
      price: $price

    ) {
      id
      slug
      title
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

export default function EventsPageClient() {
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const date = searchParams.get("date") || "";
  const price = searchParams.get("price") || "";
  const sort = searchParams.get("sort") || "";
  const [searchInput, setSearchInput] = useState(search);
  const [locationInput, setLocationInput] = useState(location);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data: any = await graphqlRequest({
          query: GET_EVENTS,
          variables: {
            search,
            category,
            location,
            date,
            price,
            sort,
            page,
            limit: 9,
          },
        });

        setEvents(data.getEvents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [search, category, location, date, price]);

  const featuredEvent = events.find((event: any) => event.isFeatured);

  const regularEvents = events.filter((event: any) => !event.isFeatured);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Mobile Filters */}
      {showFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Overlay */}
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
            aria-label="Close filters"
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 h-screen w-[85%] max-w-sm overflow-y-auto bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Filter Events
              </h2>

              <button
                onClick={() => setShowFilters(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Filters */}
            <div className="h-full overflow-y-auto bg-white p-5">
              <div className="rounded-2xl bg-white">
                <EventFilters />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-20 lg:flex">
        {/* Desktop Filters */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-24">
            <EventFilters />
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Mobile Filter Button */}
          <div className="mb-4 lg:hidden">
            <button
              onClick={() => setShowFilters(true)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              Filter Events
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <div className="rounded-2xl bg-white p-3 shadow">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="flex items-center rounded-xl bg-slate-100 px-4 py-3 md:col-span-5">
                  <span className="mr-3 text-slate-400">🔍</span>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Concerts, workshops, festivals..."
                    className="w-full bg-transparent text-sm outline-none sm:text-base"
                  />
                </div>

                <div className="flex items-center rounded-xl bg-slate-100 px-4 py-3 md:col-span-5">
                  <span className="mr-3 text-slate-400">📍</span>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Search by location"
                    className="w-full bg-transparent text-sm outline-none sm:text-base"
                  />
                </div>

                <button
                  onClick={() => {
                    const params = new URLSearchParams();

                    if (searchInput) {
                      params.set("search", searchInput);
                    }

                    if (locationInput) {
                      params.set("location", locationInput);
                    }

                    router.push(`/events?${params.toString()}`);
                  }}
                  className="rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white transition hover:bg-indigo-700 md:col-span-2"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {location
                  ? `Events in ${location}`
                  : category
                    ? `${category} Events`
                    : "Discover Events"}
              </h1>
              <p className="text-sm font-medium text-slate-500 sm:text-base">
                Browse upcoming experiences happening near you.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <span className="text-sm font-bold text-slate-400">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString());

                  if (e.target.value) {
                    params.set("sort", e.target.value);
                  } else {
                    params.delete("sort");
                  }

                  router.push(`/events?${params.toString()}`);
                }}
                className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-indigo-600 outline-none"
              >
                <option value="">Trending</option>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex justify-center py-20">
                <p>Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="col-span-full flex justify-center py-20">
                <p>No events found.</p>
              </div>
            ) : (
              <>
                {featuredEvent && (
                  <div className="md:col-span-2 xl:col-span-2">
                    <EventCard event={featuredEvent} featured />
                  </div>
                )}

                {regularEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </>
            )}
          </div>

          <div className="mt-12 flex justify-center sm:mt-16">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-full bg-slate-200 px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-indigo-600 hover:text-white sm:px-8 sm:text-base"
            >
              Load More Events
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
