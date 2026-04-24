"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

const stats = [
  {
    label: "Total Events",
    value: "24",
    change: "+12%",
    icon: "🎫",
    valueClass: "text-slate-900",
    changeClass: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Tickets Sold",
    value: "1,420",
    change: "+8.4%",
    icon: "👥",
    valueClass: "text-slate-900",
    changeClass: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Revenue",
    value: "$18,450",
    change: "+15.2%",
    icon: "💳",
    valueClass: "text-slate-900",
    changeClass: "bg-emerald-50 text-emerald-600",
  },
];

const activities = [
  {
    title: "New ticket purchased for Horizon Jazz",
    time: "2 mins ago • $120.00",
    icon: "🛒",
    bg: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "New event 'Tech Summit 2024' published",
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
    title: "Updated details for 'Gala Dinner'",
    time: "Yesterday at 4:30 PM",
    icon: "📝",
    bg: "bg-indigo-50 text-indigo-600",
  },
];

const liveEvents = [
  {
    title: "Horizon Jazz Festival",
    meta: "85% Tickets Sold • 12 Days left",
    badge: "Live",
  },
  {
    title: "Tech Summit 2024",
    meta: "42% Tickets Sold • 45 Days left",
    badge: "Upcoming",
  },
];

export default function OrganizerDashboard() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar role="organizer" />
      <Topbar title="Organizer Dashboard" />

      <div className="lg:ml-64 pt-24 p-6 md:p-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Organizer Dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Welcome back. Here’s what’s happening across your events today.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300">
              View Reports
            </button>
            <button
              onClick={() => router.push("/organizer/create-event")}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
            >
              + Create New Event
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  {item.icon}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${item.changeClass}`}
                >
                  {item.change}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <h2 className={`mt-2 text-4xl font-black tracking-tight ${item.valueClass}`}>
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        <div className="grid gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Revenue Overview
                </h3>
                <p className="text-sm text-slate-500">
                  Last 30 days performance
                </p>
              </div>

              <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-slate-50 p-4">
              <svg
                viewBox="0 0 800 260"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[20, 70, 120, 170, 220].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="800"
                    y1={y}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
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
                Peak: $4,200
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

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
              <button className="text-sm font-semibold text-indigo-600 hover:underline">
                See all
              </button>
            </div>

            <div className="space-y-5">
              {activities.map((activity) => (
                <div key={activity.title} className="flex gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ${activity.bg}`}
                  >
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-5 text-slate-900">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Live Events</h3>
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Pulse Live
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {liveEvents.map((event, index) => (
                <div
                  key={event.title}
                  className="group flex items-center gap-4 rounded-2xl p-4 transition hover:bg-slate-50"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-slate-100 text-2xl">
                    {index === 0 ? "🎷" : "💼"}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{event.title}</h4>
                    <p className="text-xs text-slate-500">{event.meta}</p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {event.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-6 text-white shadow-sm md:p-8">
            <div className="relative z-10 max-w-sm">
              <h3 className="text-2xl font-black">Upgrade to Pro</h3>
              <p className="mt-3 text-sm text-indigo-100">
                Unlock advanced analytics, priority support, premium promotion
                tools, and deeper insights for your high-volume events.
              </p>

              <button className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50">
                Learn More
              </button>
            </div>

            <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-6 top-6 text-6xl opacity-20">🚀</div>
          </div>
        </div>
      </div>
    </main>
  );
}