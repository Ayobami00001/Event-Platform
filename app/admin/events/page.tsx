import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

const events = [
  {
    id: "1",
    name: "Midnight Jazz Gala",
    status: "Upcoming",
    date: "Oct 24, 2026",
    revenue: "$14,400.00",
  },
  {
    id: "2",
    name: "Summer Solstice Soirée",
    status: "Completed",
    date: "Aug 15, 2026",
    revenue: "$62,500.00",
  },
];

export default function AdminEventsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Sidebar role="admin" />
      <Topbar title="Events" />

      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Event Management
          </h1>
          <p className="mt-2 text-slate-500">
            Review all platform events and their current status.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <table className="w-full text-left">
            <thead className="bg-slate-100/70">
              <tr>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Event
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Date
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Status
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Revenue
                </th>
                <th className="px-8 py-5 text-right text-xs font-bold uppercase tracking-widest text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50">
                  <td className="px-8 py-5 font-bold text-slate-900">
                    {event.name}
                  </td>
                  <td className="px-6 py-5 text-slate-600">{event.date}</td>
                  <td className="px-6 py-5">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-800">
                    {event.revenue}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}