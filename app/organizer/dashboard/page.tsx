"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { graphqlRequest } from "@/lib/graphqlClient";
import OrganizerTicketCheckIn from "@/components/dashboard/OrganizerTicketCheckIn";

const GET_ORGANIZER_DASHBOARD = `
query {
  getOrganizerDashboard {
    totalEvents
    totalTicketsSold
    totalRevenue
    liveEvents {
      id
      title
      status
      availableSeats
      totalTickets
    }
  }
}
`;

const activities = [
  {
    title: "New ticket purchased for Horizon Jazz",
    time: "2 mins ago • $120.00",
    icon: "🛒",
    bg: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "New event published",
    time: "45 mins ago",
    icon: "📤",
    bg: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Withdrawal processed",
    time: "3 hours ago • $2,500.00",
    icon: "💰",
    bg: "bg-slate-100 text-slate-600",
  },
  {
    title: "Updated event details",
    time: "Yesterday at 4:30 PM",
    icon: "📝",
    bg: "bg-indigo-50 text-indigo-600",
  },
];

export default function OrganizerDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data: any = await graphqlRequest({ query: GET_ORGANIZER_DASHBOARD });
        setDashboard(data.getOrganizerDashboard);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="organizer" title="Organizer Dashboard">
        <div className="p-6 lg:ml-64">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      label: "Total Events",
      value: dashboard?.totalEvents || 0,
      change: "+12%",
      icon: "🎫",
      changeClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Tickets Sold",
      value: dashboard?.totalTicketsSold || 0,
      change: "+8.4%",
      icon: "👥",
      changeClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Revenue",
      value: `$${dashboard?.totalRevenue || 0}`,
      change: "+15.2%",
      icon: "💳",
      changeClass: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
  <DashboardLayout role="organizer" title="Organizer Dashboard">
    <div className="max-w-5xl overflow-x-hidden p-4 md:p-6 lg:ml-64 lg:p-8">
      {loading ? (
        <div>Loading dashboard...</div>
      ) : (
        <>
          {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Organizer Dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Welcome back. Here's what's happening across your events today.
            </p>
          </div>

          {/* ✅ w-full on mobile so buttons don't squeeze */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="w-full rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 sm:w-auto">
              View Reports
            </button>
            <button
              onClick={() => router.push("/organizer/create-event")}
              className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 sm:w-auto"
            >
              + Create New Event
            </button>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────────────── */}
        {/* ✅ sm:grid-cols-2 lg:grid-cols-3 — all 3 show on lg tablet, not xl */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  {item.icon}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.changeClass}`}>
                  {item.change}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        {/* ── Revenue + Activity ───────────────────────────────────────── */}
        {/* ✅ lg:grid-cols-3 not xl — Revenue + Activity side by side on tablet landscape */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Revenue — spans 2 of 3 cols on lg */}
          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Revenue Overview</h3>
                <p className="text-sm text-slate-500">Last 30 days performance</p>
              </div>
              <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-slate-50 p-4">
              <svg viewBox="0 0 800 260" className="h-full w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[20, 70, 120, 170, 220].map((y) => (
                  <line key={y} x1="0" x2="800" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                ))}
                <path
                  d="M0 220 L0 175 C70 165, 120 195, 180 155 C240 115, 300 125, 360 85 C420 45, 490 75, 550 55 C610 35, 690 105, 740 72 C770 52, 790 48, 800 44 L800 260 L0 260 Z"
                  fill="url(#revenueGradient)"
                />
                <path
                  d="M0 175 C70 165, 120 195, 180 155 C240 115, 300 125, 360 85 C420 45, 490 75, 550 55 C610 35, 690 105, 740 72 C770 52, 790 48, 800 44"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="360" cy="85" r="6" fill="white" stroke="#4f46e5" strokeWidth="3" />
                <circle cx="550" cy="55" r="6" fill="white" stroke="#4f46e5" strokeWidth="3" />
              </svg>
              <div className="absolute left-[42%] top-6 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                Peak: ${dashboard?.totalRevenue || 0}
              </div>
            </div>

            <div className="mt-5 flex justify-between px-2 text-xs font-semibold text-slate-400">
              <span>OCT 01</span>
              <span>OCT 07</span>
              <span>OCT 14</span>
              <span>OCT 21</span>
              <span>OCT 30</span>
            </div>
          </div>

          {/* Recent Activity — 1 of 3 cols on lg */}
          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
              <button className="text-sm font-semibold text-indigo-600 hover:underline">
                See all
              </button>
            </div>
            <div className="space-y-5">
              {activities.map((activity) => (
                <div key={activity.title} className="flex gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ${activity.bg}`}>
                    {activity.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-5 text-slate-900">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket Check-in — organizer QR scanning and manual entry */}
        <div className="mt-8">
          <OrganizerTicketCheckIn />
        </div>

        {/* ── Live Events + Upgrade ────────────────────────────────────── */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">

          {/* ✅ min-w-0 stops horizontal overflow on the grid child */}
          <div className="min-w-0 flex flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-8
                          h-[420px] md:h-[480px] lg:h-[520px]">

            {/* Header — never scrolls */}
            <div className="mb-6 flex flex-shrink-0 items-center justify-between gap-2">
              <h3 className="truncate text-xl font-bold text-slate-900">Live Events</h3>
              <div className="flex flex-shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Pulse Live
                </span>
              </div>
            </div>

            {/* ✅ overflow-x-hidden kills any horizontal bleed inside the list */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-1
                            [&::-webkit-scrollbar]:w-1
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-slate-200
                            [&::-webkit-scrollbar-track]:bg-transparent">
              {dashboard?.liveEvents?.map((event: any) => {
                const sold = event.totalTickets - event.availableSeats;
                const percent =
                  event.totalTickets > 0
                    ? Math.round((sold / event.totalTickets) * 100)
                    : 0;

                return (
                  <div
                    key={event.id}
                    className="group flex items-center gap-3 rounded-2xl p-3 transition hover:bg-slate-50 md:gap-4 md:p-4"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-slate-100 text-xl md:h-16 md:w-16 md:text-2xl">
                      🎫
                    </div>
                    {/* ✅ min-w-0 makes truncate work inside flex */}
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-bold text-slate-900">{event.title}</h4>
                      <p className="text-xs text-slate-500">{percent}% Tickets Sold</p>
                    </div>
                    <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {event.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upgrade Card */}
          <div className="min-w-0 relative overflow-hidden rounded-3xl bg-indigo-600 p-6 text-white shadow-sm md:p-8 lg:h-[520px]">
            <div className="relative z-10">
              <h3 className="text-2xl font-black">Upgrade to Pro</h3>
              <p className="mt-3 text-sm text-indigo-100">
                Unlock advanced analytics, priority support, premium promotion
                tools, and deeper insights for your high-volume events.
              </p>
              <button className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50">
                Learn More
              </button>
            </div>
            <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-6 top-6 text-6xl opacity-20">🚀</div>
          </div>
        </div>
        </>
      )}
    </div>
  </DashboardLayout>
);
}