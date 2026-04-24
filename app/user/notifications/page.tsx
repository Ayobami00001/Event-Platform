import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

const notifications = [
  {
    id: "1",
    title: "Your ticket for Jazz Festival is confirmed!",
    body: "Show your QR code at the entrance.",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    title: "Upcoming: AI Summit starts in 2 hours",
    body: "Don't forget to check your workshop slot.",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    title: "New feature: Map discovery is now live!",
    body: "Find events near you with our new interactive map.",
    time: "5h ago",
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-28">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-slate-100/70 px-6 py-5">
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Mark all as read
            </button>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b border-slate-200 px-6 py-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  🔔
                </div>

                <div className="flex-grow">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.body}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.time}
                  </p>
                </div>

                {item.unread && (
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <button className="w-full rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-800 hover:bg-slate-200">
              View all notifications
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}