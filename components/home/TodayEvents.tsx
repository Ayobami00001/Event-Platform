const todayEvents = [
  {
    title: "Underground Jazz Sessions",
    time: "Starts at 9:00 PM",
    price: "$25",
    action: "Get Tickets",
    image:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80",
    badge: "TONIGHT",
  },
  {
    title: "Artisan Sourdough Masterclass",
    time: "Starts at 4:30 PM",
    price: "$120",
    action: "Get Tickets",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80",
    badge: "STARTS SOON",
  },
  {
    title: "SaaS Founder Coffee Meet",
    time: "Ongoing until 6 PM",
    price: "Free",
    action: "RSVP",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    badge: "",
  },
  {
    title: "Sunset Hatha Yoga Flow",
    time: "Starts at 6:30 PM",
    price: "$15",
    action: "Join Class",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    badge: "",
  },
];

export default function TodayEvents() {
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
          {todayEvents.map((event) => (
            <div
              key={event.title}
              className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
                {event.badge && (
                  <span className="absolute bottom-4 left-4 rounded bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    {event.badge}
                  </span>
                )}
              </div>

              <div className="p-5">
                <h4 className="mb-1 text-lg font-bold">{event.title}</h4>
                <p className="mb-4 text-sm text-slate-500">{event.time}</p>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600">{event.price}</span>
                  <button className="text-sm font-bold text-indigo-600 hover:underline">
                    {event.action}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}