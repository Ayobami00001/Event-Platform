const trendingEvents = [
  {
    title: "Neon Horizons Electronic Summit",
    category: "Music Festival",
    date: "Oct 24 • 8:00 PM",
    location: "Echo Dome, SF",
    price: "$89.00",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Future of AI Ethics",
    category: "Workshop",
    date: "Online",
    location: "Virtual Event",
    price: "Free",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Ultimate eSports Finals",
    category: "Sports",
    date: "Sat, Oct 26",
    location: "Gaming Arena",
    price: "$45.00",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function Trending() {
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

        <a href="/events" className="font-bold text-indigo-600 hover:underline">
          View all
        </a>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="group relative overflow-hidden rounded-3xl bg-white shadow lg:col-span-8">
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={trendingEvents[0].image}
              alt={trendingEvents[0].title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>

          <div className="p-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              {trendingEvents[0].category}
            </p>
            <h3 className="mb-4 text-3xl font-extrabold">
              {trendingEvents[0].title}
            </h3>

            <div className="flex flex-wrap gap-6 text-slate-500">
              <span>{trendingEvents[0].date}</span>
              <span>{trendingEvents[0].location}</span>
            </div>

            <p className="mt-6 text-2xl font-black">{trendingEvents[0].price}</p>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:col-span-4">
          {trendingEvents.slice(1).map((event) => (
            <div
              key={event.title}
              className="overflow-hidden rounded-2xl bg-white shadow"
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
                <p className="mb-2 text-sm text-slate-500">{event.date}</p>
                <p className="text-lg font-bold">{event.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}