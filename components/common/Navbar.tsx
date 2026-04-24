"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type UserRole = "USER" | "ORGANIZER" | "ADMIN" | null;

type NavItem = {
  label: string;
  href: string;
};

function getRoleFromToken(token: string | null): UserRole {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    setToken(storedToken);
    setRole(getRoleFromToken(storedToken));
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const publicLinks: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Explore Events", href: "/events" },
    { label: "Become Organizer", href: "/become-organizer" },
  ];

  const userLinks: NavItem[] = [
    { label: "Explore Events", href: "/events" },
    { label: "My Bookings", href: "/dashboard/bookings" },
    { label: "Saved Events", href: "/dashboard/saved-events" },
  ];

  const organizerLinks: NavItem[] = [
    { label: "Dashboard", href: "/organizer/dashboard" },
    { label: "Create Event", href: "/organizer/create-event" },
    { label: "My Events", href: "/organizer/my-events" },
    { label: "Attendees", href: "/organizer/attendees" },
  ];

  const adminLinks: NavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: "Events", href: "/admin/events" },
    { label: "Approvals", href: "/admin/approvals" },
  ];

  const links = useMemo(() => {
    if (!token || !role) return publicLinks;
    if (role === "ADMIN") return adminLinks;
    if (role === "ORGANIZER") return organizerLinks;
    return userLinks;
  }, [token, role]);

  const dashboardHref = useMemo(() => {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "ORGANIZER") return "/organizer/dashboard";
    return "/events";
  }, [role]);

  const profileHref = useMemo(() => {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "ORGANIZER") return "/organizer/dashboard";
    return "/profile";
  }, [role]);

  const navLinkClass = (href: string) =>
    pathname === href
      ? "border-b-2 border-indigo-600 pb-1 font-bold text-indigo-700"
      : "font-medium text-slate-600 transition-colors hover:text-indigo-500";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("remembered_email");
    setToken(null);
    setRole(null);
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push("/login");
  };

  const getInitial = () => {
    if (role === "ADMIN") return "A";
    if (role === "ORGANIZER") return "O";
    if (role === "USER") return "U";
    return "U";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] w-full bg-white shadow-sm">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-10">
          <Link
            href="/"
            className="relative z-[101] text-xl font-black tracking-tight text-indigo-700 sm:text-2xl"
          >
            Concierge
          </Link>
          

          <div className="hidden items-center gap-8 md:flex">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(item.href)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
          {!token ? (
            <>
              <Link
                href="/login"
                className="hidden font-medium text-slate-600 transition-colors hover:text-indigo-500 sm:block"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="hidden rounded-full bg-indigo-600 px-5 py-2.5 font-bold text-white transition hover:bg-indigo-700 sm:block"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-full border border-indigo-100 bg-white px-2 py-2 shadow-sm transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                  {getInitial()}
                </div>
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-bold text-slate-800">
                    {role === "ORGANIZER"
                      ? "Organizer"
                      : role === "ADMIN"
                        ? "Admin"
                        : "User"}
                  </p>
                  <p className="text-xs text-slate-500">Account</p>
                </div>
                <span className="hidden text-slate-500 lg:block">▾</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="relative z-[10001] flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 touch-manipulation md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="relative z-[105] border-t border-slate-200 bg-white px-4 py-4 shadow-md md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={
                  pathname === item.href
                    ? "font-bold text-indigo-700"
                    : "font-medium text-slate-600"
                }
              >
                {item.label}
              </Link>
            ))}

            {!token ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="font-medium text-slate-600 transition-colors hover:text-indigo-500"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-indigo-600 px-4 py-3 text-center font-bold text-white transition hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setMenuOpen(false)}
                  className="font-medium text-slate-600"
                >
                  Dashboard
                </Link>

                <Link
                  href={profileHref}
                  onClick={() => setMenuOpen(false)}
                  className="font-medium text-slate-600"
                >
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left font-medium text-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
