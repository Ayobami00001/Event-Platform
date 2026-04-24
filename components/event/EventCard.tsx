type Event = {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  location: string;
  price: string;
  image: string;
  featured?: boolean;
};

type EventCardProps = {
  event: Event;
  featured?: boolean;
};

export default function EventCard({
  event,
  featured = false,
}: EventCardProps) {
  if (featured) {
    return (
      <div className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-xl">
        <div className="flex flex-col md:flex-row">
          <div className="relative aspect-video w-full overflow-hidden md:w-1/2">
            <img
              src={event.image}
              alt={event.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-700">
              {event.date}
            </div>
          </div>

          <div className="flex flex-1 flex-col bg-slate-50/60 p-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Trending
              </span>
              <span className="text-xs font-bold text-slate-400">
                {event.category}
              </span>
            </div>

            <h3 className="mb-4 text-2xl font-extrabold leading-tight">
              {event.title}
            </h3>

            <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
              <span>📍</span>
              <span>{event.location}</span>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Starting from
                </p>
                <p className="text-xl font-black text-indigo-700">
                  {event.price}
                </p>
              </div>

              <a
                href={`/events/${event.slug}`}
                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                View Details
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-xl">
      <div className="relative m-2 h-64 overflow-hidden rounded-2xl">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-700">
          {event.date}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-2">
          <span className="text-xs font-bold text-slate-400">
            {event.category}
          </span>
        </div>

        <h3 className="mb-4 text-lg font-extrabold">{event.title}</h3>

        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <span>📍</span>
          <span>{event.location}</span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-lg font-black text-indigo-700">{event.price}</p>

          <a
            href={`/events/${event.slug}`}
            className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-indigo-100 hover:text-indigo-700"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
}