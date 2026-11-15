"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

type UserRole = "USER" | "ORGANIZER" | "ADMIN" | null;
type StoredUser = {
  fullName?: string;
  email?: string;
  avatar?: string;
  role?: UserRole;
};
type NavItem = { label: string; href: string };

function getRoleFromToken(token: string | null): UserRole {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

function subscribeToAuth(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("focus", callback);
  window.addEventListener("auth-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("focus", callback);
    window.removeEventListener("auth-change", callback);
  };
}

function getAuthSnapshot() {
  return JSON.stringify({
    token: localStorage.getItem("token"),
    user: localStorage.getItem("user"),
  });
}

function getServerAuthSnapshot() {
  return JSON.stringify({ token: null, user: null });
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const authSnapshot = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );

  const auth = useMemo(() => {
    try {
      return JSON.parse(authSnapshot) as {
        token: string | null;
        user: string | null;
      };
    } catch {
      return { token: null, user: null };
    }
  }, [authSnapshot]);

  const storedUser = useMemo<StoredUser | null>(() => {
    if (!auth.user) return null;
    try {
      return JSON.parse(auth.user) as StoredUser;
    } catch {
      return null;
    }
  }, [auth.user]);

  const token = auth.token;
  const role = getRoleFromToken(token) || storedUser?.role || null;
  const isLoggedIn = Boolean(token);
  const displayName =
    storedUser?.fullName?.trim() ||
    (role === "ORGANIZER"
      ? "Organizer"
      : role === "ADMIN"
        ? "Admin"
        : "Account");
  const initial = displayName.charAt(0).toUpperCase() || "U";

  const publicLinks: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Explore Events", href: "/events" },
    { label: "Become an Organizer", href: "/become-organizer" },
  ];
  const userLinks: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Explore Events", href: "/events" },
    { label: "My Bookings", href: "/user/booking" },
    { label: "Saved Events", href: "/user/saved-events" },
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

  const links =
    !isLoggedIn || !role
      ? publicLinks
      : role === "ADMIN"
        ? adminLinks
        : role === "ORGANIZER"
          ? organizerLinks
          : userLinks;

  const dashboardHref =
    role === "ADMIN"
      ? "/admin/dashboard"
      : role === "ORGANIZER"
        ? "/organizer/dashboard"
        : "/user/dashboard";
  const profileHref =
    role === "ORGANIZER"
      ? "/organizer/profile"
      : role === "USER"
        ? "/user/profile"
        : "/admin/dashboard";

  const closeMenus = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("remembered_email");
    window.dispatchEvent(new Event("auth-change"));
    closeMenus();
    router.push("/login");
  };

  const navLinkClass = (href: string) => {
    const active = isActivePath(pathname, href);
    return [
      "whitespace-nowrap rounded-full px-3.5 py-2 text-sm transition-colors duration-200",
      active
        ? "bg-indigo-50 font-semibold text-indigo-700"
        : "font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-700",
    ].join(" ");
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] border-b border-slate-200/80 bg-white/95 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[76px] max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        >
          <Link
            href="/"
            onClick={closeMenus}
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="Concierge home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-black text-white shadow-md shadow-indigo-600/20 transition-transform group-hover:-rotate-3 group-hover:scale-105">
              C
            </span>
            <span className="text-[21px] font-black tracking-[-0.06em] text-slate-900 sm:text-2xl">
              Concierge<span className="text-indigo-600">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  isActivePath(pathname, item.href) ? "page" : undefined
                }
                className={navLinkClass(item.href)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-700"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg"
                >
                  Get started
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-indigo-200 hover:bg-slate-50"
                >
                  {storedUser?.avatar ? (
                    <img
                      src={storedUser.avatar}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 ring-2 ring-white">
                      {initial}
                    </span>
                  )}
                  <span className="max-w-32 text-left">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {displayName}
                    </span>
                    <span className="block text-[11px] font-medium capitalize text-slate-500">
                      {role?.toLowerCase() || "account"}
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
                  >
                    <div className="border-b border-slate-100 px-3 py-3">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {storedUser?.email ||
                          `${role?.toLowerCase() || "user"} account`}
                      </p>
                    </div>
                    <Link
                      role="menuitem"
                      href={dashboardHref}
                      onClick={() => setDropdownOpen(false)}
                      className="mt-2 block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-indigo-700"
                    >
                      Dashboard
                    </Link>
                    <Link
                      role="menuitem"
                      href={profileHref}
                      onClick={() => setDropdownOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-indigo-700"
                    >
                      Profile settings
                    </Link>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 lg:hidden"
          >
            {menuOpen ? (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[99] bg-slate-950/30 backdrop-blur-[2px] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default"
          />
          <div
            id="mobile-navigation"
            className="absolute inset-x-0 top-[76px] max-h-[calc(100dvh-76px)] overflow-y-auto rounded-b-[28px] border-t border-slate-100 bg-white px-5 pb-7 pt-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Navigation
              </p>
              {isLoggedIn && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                  {role?.toLowerCase()}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {links.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] transition ${active ? "bg-indigo-50 font-bold text-indigo-700" : "font-semibold text-slate-700 hover:bg-slate-50"}`}
                  >
                    {item.label}
                    <span className="text-lg text-slate-300" aria-hidden="true">
                      ›
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-indigo-700"
                  >
                    Get started
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    {storedUser?.avatar ? (
                      <img
                        src={storedUser.avatar}
                        alt=""
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                        {initial}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {storedUser?.email || role}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={dashboardHref}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={profileHref}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                    >
                      Profile
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 w-full rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-100"
                  >
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
