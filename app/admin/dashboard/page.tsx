import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AdminDashboard() {
  return (
    <DashboardLayout title="dashboard" role="admin">
      <div className="lg:ml-64 p-4 md:p-6 lg:p-8 max-w-5xl">
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
    </DashboardLayout>
  );
}