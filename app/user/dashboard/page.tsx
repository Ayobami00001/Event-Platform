import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function UserDashboard() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <Sidebar role="user" />
      <Topbar title="Dashboard" />

      <div className="ml-64 p-8">
        <h1 className="text-3xl font-extrabold mb-2">
          Welcome back, John!
        </h1>
        <p className="text-slate-500 mb-8">
          You have 3 events coming up this week.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow"
            >
              <h3 className="font-bold text-lg mb-2">
                Jazz Under the Stars
              </h3>
              <p className="text-sm text-slate-500">
                Botanical Gardens, NY
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}