type ApprovalEvent = {
  id: string;
  title: string;
  category: string;
  mode: string;
  date: string;
  organizer: string;
  image: string;
  status: string;
};

export default function ApprovalCard({
  event,
}: {
  event: ApprovalEvent;
}) {
  return (
    <div className="group flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl">
      <div className="relative h-48 overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur">
            {event.category}
          </span>
        </div>

        <div className="absolute bottom-4 right-4">
          <span className="rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-medium text-white">
            {event.mode}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              {event.title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span>📅</span>
              <span>{event.date}</span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold uppercase text-orange-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
            {event.status}
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-3">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
            alt={event.organizer}
            className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
          />
          <div>
            <p className="text-xs text-slate-500">Organized by</p>
            <p className="text-sm font-bold text-slate-900">{event.organizer}</p>
          </div>

          <button className="ml-auto text-xs font-bold text-indigo-600 hover:underline">
            View Profile
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="flex-1 rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95">
            Approve
          </button>

          <button className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold text-red-600 transition-all hover:border-transparent hover:bg-red-50 active:scale-95">
            Reject
          </button>
        </div>

        <button className="w-full text-center text-sm font-bold text-slate-500 hover:text-indigo-600">
          View Full Submission
        </button>
      </div>
    </div>
  );
}