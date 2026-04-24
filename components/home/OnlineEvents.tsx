const onlineEvents = [
  {
    title: "Remote Leadership Masterclass",
    subtitle: "Monday, Oct 28 • Zoom",
    price: "$20.00",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Creative Flow Live Stream",
    subtitle: "Friday, Nov 1 • Twitch",
    price: "Free",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "React 19 Deep Dive",
    subtitle: "Wed, Nov 6 • YouTube Live",
    price: "Free",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function OnlineEvents() {
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
            {onlineEvents.map((event) => (
              <div
                key={event.title}
                className="w-80 flex-shrink-0 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl"
              >
                <div className="mb-6 h-40 overflow-hidden rounded-2xl">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <h4 className="mb-2 text-xl font-bold">{event.title}</h4>
                <p className="mb-4 text-sm text-indigo-100">{event.subtitle}</p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{event.price}</span>
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