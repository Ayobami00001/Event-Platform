"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  role?: "user" | "organizer" | "admin";
  isOpen?: boolean;
  onClose?: () => void;
};

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export default function Sidebar({
  role = "user",
  isOpen = false,
  onClose,
}: Props) {
  const pathname = usePathname();

  const navItems: Record<"user" | "organizer" | "admin", NavItem[]> = {
    admin: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
      { label: "Users", href: "/admin/users", icon: "👥" },
      { label: "Events", href: "/admin/events", icon: "🎫" },
      { label: "Approvals", href: "/admin/approvals", icon: "✅" },
    ],
    organizer: [
      { label: "Dashboard", href: "/organizer/dashboard", icon: "📊" },
      { label: "Create Event", href: "/organizer/create-event", icon: "➕" },
      { label: "My Events", href: "/organizer/my-events", icon: "🎫" },
      { label: "Attendees", href: "/organizer/attendees", icon: "👥" },
    ],
    user: [
      { label: "Dashboard", href: "/dashboard", icon: "📊" },
      { label: "My Bookings", href: "/bookings", icon: "📅" },
      { label: "Saved Events", href: "/saved", icon: "❤️" },
      { label: "Profile", href: "/profile", icon: "👤" },
    ],
  };

  const links = navItems[role];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-8 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        <div className="mb-10 flex items-start justify-between">
          <Link href="/" className="block" onClick={onClose}>
            <h1 className="text-2xl font-black tracking-tight text-indigo-600">
              Concierge
            </h1>
            <p className="text-xs text-slate-400">Event Platform</p>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {links.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border border-indigo-100 bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <Link
            href="/events"
            onClick={onClose}
            className="block w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Explore Events
          </Link>
        </div>
      </aside>
    </>
  );
}