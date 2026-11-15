"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { graphqlRequest } from "@/lib/graphqlClient";
import { useEffect, useState } from "react";
import Link from "next/link";

const GET_ALL_USERS = `
query GetAllUsers {
  getAllUsers {
    id
    fullName
    email
    avatar
    phone
    role
    status
    createdAt
  }
}
`;

const TOGGLE_USER_STATUS = `
mutation ToggleUserStatus($userId: ID!) {
  toggleUserStatus(userId: $userId) {
    id
    status
  }
}
`;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("ALL");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data: any = await graphqlRequest({
          query: GET_ALL_USERS,
        });
        

        setUsers(data.getAllUsers);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleStatus = async (userId: string) => {
  try {
    const data: any = await graphqlRequest({
      query: TOGGLE_USER_STATUS,
      variables: {
        userId,
      },
    });

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, status: data.toggleUserStatus.status }
          : user
      )
    );
  } catch (error) {
    console.error(error);
  }
};

  const totalUsers = users.length;

  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;

  const blockedUsers = users.filter((user) => user.status === "BLOCKED").length;

  const admins = users.filter((user) => user.role === "ADMIN").length;

  const filteredUsers = users.filter((user) => {
    if (selectedRole === "ALL") return true;
    return user.role === selectedRole;
  });

  if (loading) {
    return (
      <DashboardLayout title="users" role="admin">
        <div className="p-10">Loading users...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="users" role="admin">
      <div className="lg:ml-64 p-4 md:p-6 lg:p-8 max-w-5xl">
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
              <button
                onClick={() => setSelectedRole("ALL")}
                className={`rounded-xl px-4 py-2 text-xs font-bold ${
                  selectedRole === "ALL"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                All Users
              </button>

              <button
                onClick={() => setSelectedRole("ADMIN")}
                className={`rounded-xl px-4 py-2 text-xs font-bold ${
                  selectedRole === "ADMIN"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Admin
              </button>

              <button
                onClick={() => setSelectedRole("ORGANIZER")}
                className={`rounded-xl px-4 py-2 text-xs font-bold ${
                  selectedRole === "ORGANIZER"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Organizer
              </button>

              <button
                onClick={() => setSelectedRole("USER")}
                className={`rounded-xl px-4 py-2 text-xs font-bold ${
                  selectedRole === "USER"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
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
            <h3 className="text-2xl font-extrabold">{totalUsers}</h3>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 rounded-xl bg-emerald-50 p-2 text-emerald-600 w-fit">
              ⚡
            </div>
            <p className="text-sm font-medium text-slate-500">Active Now</p>
            <h3 className="text-2xl font-extrabold">{activeUsers}</h3>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 rounded-xl bg-slate-100 p-2 text-slate-600 w-fit">
              ⏳
            </div>
            <p className="text-sm font-medium text-slate-500">
              Administrators
            </p>
            <h3 className="text-2xl font-extrabold">{admins}</h3>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 rounded-xl bg-red-50 p-2 text-red-600 w-fit">
              ⛔
            </div>
            <p className="text-sm font-medium text-slate-500">
              Blocked Accounts
            </p>
            <h3 className="text-2xl font-extrabold">{blockedUsers}</h3>
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
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar || "/avatar.png"}
                        alt={user.fullName}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900">
                          {user.fullName}
                        </p>
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
                        user.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm font-medium text-slate-600">
                    {new Date(Number(user.createdAt)).toLocaleDateString()}
                  </td>

                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleStatus(user.id)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold ${
                          user.status === "ACTIVE"
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {user.status === "ACTIVE" ? "Block" : "Unblock"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
