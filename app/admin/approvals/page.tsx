import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ApprovalCard from "@/components/dashboard/ApprovalCard";

const pendingEvents = [
  {
    id: "1",
    title: "Neon Nights Concert",
    category: "Concert",
    mode: "Physical",
    date: "Oct 24, 2026 • 09:00 PM",
    organizer: "Alex Rivera",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    status: "Pending Review",
  },
  {
    id: "2",
    title: "Creative Design Summit",
    category: "Conference",
    mode: "Online",
    date: "Nov 03, 2026 • 11:00 AM",
    organizer: "Maya Stone",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    status: "Pending Review",
  },
  {
    id: "3",
    title: "Luxury Food Experience",
    category: "Food",
    mode: "Physical",
    date: "Nov 10, 2026 • 06:30 PM",
    organizer: "Daniel Reese",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    status: "Pending Review",
  },
];

export default function AdminApprovalsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Sidebar role="admin" />
      <Topbar title="Approvals" />

      <div className="ml-64 space-y-10 p-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Event Approvals
            </h1>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              12 Pending Submissions
            </span>
          </div>

          <p className="max-w-2xl text-lg text-slate-500">
            Review and manage upcoming experiences from organizers before they
            go live on the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {pendingEvents.map((event) => (
            <ApprovalCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}