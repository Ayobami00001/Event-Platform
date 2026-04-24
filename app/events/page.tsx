import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import EventCard from "@/components/event/EventCard";
import EventFilters from "@/components/event/EventFilters";

const events = [
  {
    id: "1",
    slug: "underground-beats-london",
    title: "Underground Beats: London's Secret Warehouse Session",
    category: "Music & Nightlife",
    date: "12 Oct • 21:00",
    location: "Hackney Wick, London",
    price: "$45.00",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    featured: true,
  },
  {
    id: "2",
    slug: "modern-minimalist-gallery-view",
    title: "Modern Minimalist: Private Gallery View",
    category: "Arts & Culture",
    date: "15 Oct • 10:00",
    location: "Mayfair, London",
    price: "Free",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "3",
    slug: "tech-founder-summit",
    title: "Silicon Roundabout: Tech Founder Summit",
    category: "Business & Tech",
    date: "16 Oct • 09:00",
    location: "Old Street, London",
    price: "From $120",
    image:
      "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "4",
    slug: "artisan-pasta-masterclass",
    title: "Artisan Pasta Masterclass",
    category: "Food & Drink",
    date: "18 Oct • 18:30",
    location: "Soho, London",
    price: "From $65",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "5",
    slug: "future-of-ai-symposium",
    title: "The Future of AI: London Symposium",
    category: "Education",
    date: "20 Oct • 15:00",
    location: "Online",
    price: "$25.00",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function EventsPage() {
  const featuredEvent = events.find((event) => event.featured);
  const regularEvents = events.filter((event) => !event.featured);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

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
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100">
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
                    placeholder="Concerts, workshops, festivals..."
                    className="w-full bg-transparent text-sm outline-none sm:text-base"
                  />
                </div>

                <div className="flex items-center rounded-xl bg-slate-100 px-4 py-3 md:col-span-5">
                  <span className="mr-3 text-slate-400">📍</span>
                  <input
                    type="text"
                    placeholder="London, UK"
                    className="w-full bg-transparent text-sm outline-none sm:text-base"
                  />
                </div>

                <button className="rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white transition hover:bg-indigo-700 md:col-span-2">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Events in London
              </h1>
              <p className="text-sm font-medium text-slate-500 sm:text-base">
                Discover curated experiences happening this week.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <span className="text-sm font-bold text-slate-400">Sort by:</span>
              <select className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-indigo-600 outline-none">
                <option>Trending</option>
                <option>Latest</option>
                <option>Nearest</option>
              </select>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredEvent && (
              <div className="md:col-span-2 xl:col-span-2">
                <EventCard event={featuredEvent} featured />
              </div>
            )}

            {regularEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div className="mt-12 flex justify-center sm:mt-16">
            <button className="rounded-full bg-slate-200 px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-indigo-600 hover:text-white sm:px-8 sm:text-base">
              Load More Events
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}