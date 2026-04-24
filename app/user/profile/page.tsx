import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function ProfilePage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <Sidebar role="user" />
      <Topbar title="Profile" />

      <div className="ml-64 p-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 shadow">
          <h1 className="text-3xl font-bold mb-4">
            Alex Rivera
          </h1>

          <p className="text-slate-500 mb-6">
            Premium Member
          </p>

          <div className="space-y-4">
            <input
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg"
            />
            <input
              placeholder="Email"
              className="w-full p-3 border rounded-lg"
            />

            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}