import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

const users = [
  {
    id: "1",
    name: "Elena Stone",
    email: "elena@concierge.com",
    role: "Organizer",
    status: "Active",
    joined: "Jan 12, 2026",
  },
  {
    id: "2",
    name: "Marcus Hale",
    email: "marcus@indigo.com",
    role: "Admin",
    status: "Active",
    joined: "Feb 03, 2026",
  },
  {
    id: "3",
    name: "Daniel Ross",
    email: "daniel@guest.com",
    role: "Attendee",
    status: "Blocked",
    joined: "Mar 19, 2026",
  },
];

export default function AdminUsersPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Sidebar role="admin" />
      <Topbar title="User Management" />

      <div className="ml-64 flex-1 space-y-8 p-10">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              User Management
            </h1>
            <p className="font-medium text-slate-500">
              Oversee platform access, roles, and account security.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex rounded-2xl bg-slate-100 p-1">
              <button className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-indigo-600 shadow-sm">
                All Users
              </button>
              <button className="px-4 py-2 text-xs font-semibold text-slate-500">
                Admin
              </button>
              <button className="px-4 py-2 text-xs font-semibold text-slate-500">
                Organizer
              </button>
              <button className="px-4 py-2 text-xs font-semibold text-slate-500">
                Attendee
              </button>
            </div>

            <button className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
              <span>⚙️</span>
              More Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                👥
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                +12%
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <h3 className="text-2xl font-extrabold">12,482</h3>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 rounded-xl bg-emerald-50 p-2 text-emerald-600 w-fit">
              ⚡
            </div>
            <p className="text-sm font-medium text-slate-500">Active Now</p>
            <h3 className="text-2xl font-extrabold">856</h3>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 rounded-xl bg-slate-100 p-2 text-slate-600 w-fit">
              ⏳
            </div>
            <p className="text-sm font-medium text-slate-500">Pending Invites</p>
            <h3 className="text-2xl font-extrabold">43</h3>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 rounded-xl bg-red-50 p-2 text-red-600 w-fit">
              ⛔
            </div>
            <p className="text-sm font-medium text-slate-500">Blocked Accounts</p>
            <h3 className="text-2xl font-extrabold">12</h3>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-100/70">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  User Information
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Access Role
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Current Status
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Join Date
                </th>
                <th className="px-8 py-5 text-right text-xs font-bold uppercase tracking-widest text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                        alt={user.name}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm font-medium text-slate-600">
                    {user.joined}
                  </td>

                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">
                        Edit
                      </button>
                      <button className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100">
                        Block
                      </button>
                    </div>
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