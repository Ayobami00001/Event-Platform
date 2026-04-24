import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function AdminDashboard() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <Sidebar role="admin" />
      <Topbar title="Admin Dashboard" />

      <div className="ml-64 p-8">
        <h1 className="text-3xl font-extrabold mb-6">
          Platform Overview
        </h1>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <p>Users</p>
            <h2 className="text-3xl font-bold">12,840</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Events</p>
            <h2 className="text-3xl font-bold">1,420</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Bookings</p>
            <h2 className="text-3xl font-bold">42,950</h2>
          </div>

          <div className="bg-indigo-600 text-white p-6 rounded-xl shadow">
            <p>Active Now</p>
            <h2 className="text-3xl font-bold">1,204</h2>
          </div>
        </div>
      </div>
    </main>
  );
}