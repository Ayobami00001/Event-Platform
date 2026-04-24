"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type UserRole = "USER" | "ORGANIZER" | "ADMIN" | null;

function getRoleFromToken(token: string | null): UserRole {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export default function Topbar({ title }: { title: string }) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setRole(getRoleFromToken(token));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const event = new CustomEvent("dashboard-sidebar-toggle", {
      detail: { open: sidebarOpen },
    });
    window.dispatchEvent(event);
  }, [sidebarOpen]);

  const getInitial = () => {
    if (role === "ADMIN") return "A";
    if (role === "ORGANIZER") return "O";
    if (role === "USER") return "U";
    return "U";
  };

  const getRoleLabel = () => {
    if (role === "ADMIN") return "Admin";
    if (role === "ORGANIZER") return "Organizer";
    if (role === "USER") return "User";
    return "Account";
  };

  const getDashboardHref = () => {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "ORGANIZER") return "/organizer/dashboard";
    return "/events";
  };

  const getProfileHref = () => {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "ORGANIZER") return "/organizer/dashboard";
    return "/profile";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("remembered_email");
    setDropdownOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex h-full items-center justify-between px-4 md:px-8 lg:ml-64">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <div>
            <h2 className="text-lg font-bold text-slate-900 md:text-xl">
              {title}
            </h2>
            <p className="hidden text-xs text-slate-500 md:block">
              Welcome back 👋
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden md:block">
            <input
              placeholder="Search..."
              className="w-48 rounded-xl bg-slate-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 lg:w-64"
            />
          </div>

          <button className="relative rounded-xl p-2 transition hover:bg-slate-100">
            🔔
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button className="rounded-xl p-2 transition hover:bg-slate-100">
            ⚙️
          </button>

          <div
            ref={dropdownRef}
            className="relative flex items-center gap-2 border-l border-slate-200 pl-2"
          >
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-slate-100"
            >
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-slate-900">
                  {getRoleLabel()}
                </p>
                <p className="text-xs text-slate-500">Dashboard</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                {getInitial()}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">
                    {getRoleLabel()} Account
                  </p>
                  <p className="text-xs text-slate-500">
                    Manage your account
                  </p>
                </div>

                <div className="flex flex-col p-2">
                  <Link
                    href={getDashboardHref()}
                    onClick={() => setDropdownOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Dashboard
                  </Link>

                  <Link
                    href={getProfileHref()}
                    onClick={() => setDropdownOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}