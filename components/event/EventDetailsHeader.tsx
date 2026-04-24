type EventDetailsHeaderProps = {
  event: {
    title: string;
    image?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
  };
};

export default function EventDetailsHeader({
  event,
}: EventDetailsHeaderProps) {
  return (
    <section className="relative flex min-h-[600px] w-full items-end overflow-hidden lg:h-[716px]">
      <div className="absolute inset-0">
        <img
          src={
            event.image ||
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=80"
          }
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-end gap-8 px-6 pb-16 lg:px-8 md:grid-cols-12">
        <div className="space-y-4 md:col-span-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/80 px-4 py-1.5 text-sm font-bold tracking-wide text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#4edea3]" />
            {event.category || "LIVE EVENT"}
          </div>

          <h1 className="text-5xl font-extrabold leading-none tracking-tight text-white drop-shadow-lg md:text-7xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-lg font-medium text-white/90">
            <div className="flex items-center gap-2">
              <span className="text-indigo-400">📅</span>
              {event.startDate || "Date coming soon"}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-indigo-400">⏰</span>
              {event.startTime && event.endTime
                ? `${event.startTime} — ${event.endTime}`
                : event.startTime || "Time coming soon"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}