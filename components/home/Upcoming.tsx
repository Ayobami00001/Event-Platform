const upcomingEvents = [
  {
    title: "Summer Soundwaves: Outdoor Series",
    category: "Music",
    date: "Nov 12, 2026",
    time: "1:00 PM - 10:00 PM",
    location: "Waterfront Park",
    price: "From $55.00",
    action: "Book Tickets",
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "InnoSummit 2026: The Future of SaaS",
    category: "Tech",
    date: "Dec 05, 2026",
    time: "9:00 AM - 5:00 PM",
    location: "Grand Convention Center",
    price: "$299.00",
    action: "Register Now",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Metropolis City Half Marathon",
    category: "Sports",
    date: "Jan 15, 2027",
    time: "6:30 AM",
    location: "City Square",
    price: "$45.00",
    action: "Register",
    image:
      "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function Upcoming() {
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
        {upcomingEvents.map((event) => (
          <div
            key={event.title}
            className="group flex flex-col gap-8 rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg md:flex-row"
          >
            <div className="h-48 w-full overflow-hidden rounded-2xl md:w-72">
              <img
                src={event.image}
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
                  <h3 className="mt-1 text-2xl font-extrabold">{event.title}</h3>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4 text-sm text-slate-500 lg:grid-cols-4">
                <div>{event.date}</div>
                <div>{event.time}</div>
                <div>{event.location}</div>
                <div>{event.price}</div>
              </div>

              <div className="flex gap-4">
                <button className="rounded-full bg-indigo-600 px-6 py-2 font-bold text-white transition hover:bg-indigo-700">
                  {event.action}
                </button>
                <button className="rounded-full border border-slate-300 px-6 py-2 font-bold text-slate-700 transition hover:bg-slate-100">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}