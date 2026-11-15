"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";

type User = {
  id: string;
  fullName: string;
  avatar?: string | null;
  role: "USER" | "ORGANIZER" | "ADMIN";
};

type EventSummary = {
  id: string;
  slug?: string | null;
  title: string;
  image?: string | null;
  startDate?: string | null;
  startTime?: string | null;
  locationName?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pricing?: "FREE" | "PAID" | null;
  currency?: string | null;
  price?: number | null;
};

type Booking = {
  id: string;
  quantity: number;
  totalPrice: number;
  bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PAID" | "UNPAID" | "FAILED" | "REFUNDED";
  event: EventSummary | null;
};

type FollowedOrganizer = {
  id: string;
  fullName: string;
  avatar?: string | null;
  organizationName?: string | null;
  organizationLogo?: string | null;
  organizationDescription?: string | null;
  organizerBio?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

type DashboardData = {
  me: User | null;
  getMyBookings: Booking[];
  getMySavedEvents: EventSummary[];
  getMyFollowedOrganizers: FollowedOrganizer[];
};

type GraphQLResult<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const DASHBOARD_QUERY = `
  query UserDashboard {
    me {
      id
      fullName
      avatar
      role
    }

    getMyBookings {
      id
      quantity
      totalPrice
      bookingStatus
      paymentStatus
      event {
        id
        slug
        title
        image
        startDate
        startTime
        locationName
        city
        state
        country
        pricing
        currency
        price
      }
    }

    getMyFollowedOrganizers {
  id
  fullName
  avatar
  role
  organizationName
  organizationLogo
  organizationDescription
  organizerBio
  city
  state
  country
}

    getMySavedEvents {
      id
      slug
      title
      image
      startDate
      startTime
      locationName
      city
      state
      country
      pricing
      currency
      price
    }
  }
`;

const UNSAVE_EVENT = `
  mutation UnsaveEvent($eventId: ID!) {
    unsaveEvent(eventId: $eventId) {
      id
    }
  }
`;

const UNFOLLOW_ORGANIZER = `
  mutation UnfollowOrganizer($organizerId: ID!) {
    unfollowOrganizer(organizerId: $organizerId)
  }
`;

async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to view your dashboard.");
  }

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const result: GraphQLResult<T> = await response.json();

  if (!response.ok || result.errors?.length || !result.data) {
    throw new Error(
      result.errors?.[0]?.message || "Unable to load your dashboard.",
    );
  }

  return result.data;
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "calendar"
    | "location"
    | "ticket"
    | "arrow"
    | "heart"
    | "clock"
    | "bookmark";
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...common}
    >
      {name === "calendar" && (
        <>
          <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
          <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" />
        </>
      )}
      {name === "location" && (
        <>
          <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
          <circle cx="12" cy="10" r="2.2" />
        </>
      )}
      {name === "ticket" && (
        <path d="M4 7.5A2.5 2.5 0 0 0 4 12.5v4A1.5 1.5 0 0 0 5.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-4a2.5 2.5 0 0 1 0-5v-1A1.5 1.5 0 0 0 18.5 5h-13A1.5 1.5 0 0 0 4 6.5v1Z" />
      )}
      {name === "arrow" && <path d="M5 12h14m-6-6 6 6-6 6" />}
      {name === "heart" && (
        <path d="M20.5 8.8c0 5.2-8.5 10-8.5 10s-8.5-4.8-8.5-10a4.6 4.6 0 0 1 8.5-2.4 4.6 4.6 0 0 1 8.5 2.4Z" />
      )}
      {name === "clock" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </>
      )}
      {name === "bookmark" && (
        <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.8L6 21V4.8Z" />
      )}
    </svg>
  );
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string | null) {
  const date = parseDate(value);
  if (!date) return "Date to be announced";

  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLocation(event: EventSummary) {
  return (
    event.locationName ||
    [event.city, event.state, event.country].filter(Boolean).join(", ") ||
    "Location to be announced"
  );
}

function formatMoney(amount?: number | null, currency?: string | null) {
  if (!amount || amount <= 0) return "Free";

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || "NGN"} ${amount.toLocaleString()}`;
  }
}

function eventHref(event: EventSummary) {
  return event.slug ? `/events/${event.slug}` : "/events";
}

function EventImage({
  event,
  className,
}: {
  event: EventSummary;
  className: string;
}) {
  return event.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={event.image} alt={event.title} className={className} />
  ) : (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-100 to-slate-100`}
      aria-label={`${event.title} image unavailable`}
    >
      <Icon name="calendar" className="h-10 w-10 text-indigo-400" />
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon name="calendar" className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      <Link
        href={actionHref}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
      >
        {actionLabel}
        <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function UserDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedEvents, setSavedEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingEventId, setRemovingEventId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [followedOrganizers, setFollowedOrganizers] = useState<
    FollowedOrganizer[]
  >([]);

  const [removingOrganizerId, setRemovingOrganizerId] = useState<string | null>(
    null,
  );

  const loadDashboard = useCallback(async () => {
    const data = await graphqlRequest<DashboardData>(DASHBOARD_QUERY);

    if (!data.me) {
      router.replace("/login");
      return;
    }

    if (data.me.role === "ORGANIZER") {
      router.replace("/organizer/dashboard");
      return;
    }

    if (data.me.role === "ADMIN") {
      router.replace("/admin/dashboard");
      return;
    }

    setUser(data.me);
    setBookings(data.getMyBookings || []);
    setSavedEvents(data.getMySavedEvents || []);
    setFollowedOrganizers(data.getMyFollowedOrganizers || []);
  }, [router]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        await loadDashboard();
      } catch (error) {
        if (active) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load dashboard.";

          if (message.toLowerCase().includes("unauthorized")) {
            router.replace("/login");
            return;
          }

          setNotice(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [loadDashboard, router]);

  const todayStart = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }, []);

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((booking) => {
          const eventDate = parseDate(booking.event?.startDate);
          return (
            booking.bookingStatus !== "CANCELLED" &&
            eventDate !== null &&
            eventDate.getTime() >= todayStart
          );
        })
        .sort((a, b) => {
          const aDate = parseDate(a.event?.startDate)?.getTime() ?? Infinity;
          const bDate = parseDate(b.event?.startDate)?.getTime() ?? Infinity;
          return aDate - bDate;
        }),
    [bookings, todayStart],
  );

  const historyBookings = useMemo(
    () =>
      bookings
        .filter((booking) => {
          const eventDate = parseDate(booking.event?.startDate);
          return (
            booking.bookingStatus === "CANCELLED" ||
            (eventDate !== null && eventDate.getTime() < todayStart)
          );
        })
        .sort((a, b) => {
          const aDate = parseDate(a.event?.startDate)?.getTime() ?? 0;
          const bDate = parseDate(b.event?.startDate)?.getTime() ?? 0;
          return bDate - aDate;
        })
        .slice(0, 4),
    [bookings, todayStart],
  );

  async function handleRemoveSavedEvent(eventId: string) {
    if (removingEventId) return;

    try {
      setRemovingEventId(eventId);
      setNotice("");

      await graphqlRequest(UNSAVE_EVENT, { eventId });

      setSavedEvents((current) =>
        current.filter((event) => event.id !== eventId),
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to remove saved event.",
      );
    } finally {
      setRemovingEventId(null);
    }
  }

  const mainBooking = upcomingBookings[0];
  const secondaryBooking = upcomingBookings[1];

  async function handleUnfollowOrganizer(organizerId: string) {
    try {
      setRemovingOrganizerId(organizerId);
      setNotice("");

      await graphqlRequest(UNFOLLOW_ORGANIZER, { organizerId });

      setFollowedOrganizers((current) =>
        current.filter((organizer) => organizer.id !== organizerId),
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to unfollow organizer.",
      );
    } finally {
      setRemovingOrganizerId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fb]">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-72 rounded-xl bg-slate-200" />
            <div className="h-5 w-96 max-w-full rounded-lg bg-slate-200" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-80 rounded-3xl bg-slate-200 lg:col-span-2" />
              <div className="h-80 rounded-3xl bg-slate-200" />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-64 rounded-3xl bg-slate-200 lg:col-span-2" />
              <div className="h-64 rounded-3xl bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fb] font-sans text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-7xl space-y-10 px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Your Concierge
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back, {user?.fullName?.split(" ")[0] || "there"}.
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
              {upcomingBookings.length > 0
                ? `You have ${upcomingBookings.length} upcoming ${
                    upcomingBookings.length === 1 ? "event" : "events"
                  } in your schedule.`
                : "Your next great experience is waiting to be discovered."}
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            Explore events
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </section>

        {notice && (
          <div
            role="alert"
            className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="font-bold"
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {/* Upcoming Events */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Your schedule
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                Upcoming Events
              </h2>
            </div>
            <Link
              href="/user/booking"
              className="shrink-0 text-sm font-bold text-indigo-600 transition hover:text-indigo-800"
            >
              View all bookings
            </Link>
          </div>

          {mainBooking?.event ? (
            <div className="grid gap-5 lg:grid-cols-3">
              <article className="group overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm transition hover:shadow-xl lg:col-span-2">
                <div className="grid h-full md:grid-cols-2">
                  <div className="relative min-h-64 overflow-hidden bg-slate-100">
                    <EventImage
                      event={mainBooking.event}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur">
                      {mainBooking.bookingStatus}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between bg-white p-6 sm:p-8">
                    <div>
                      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-indigo-600">
                        <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5">
                          <Icon name="calendar" className="h-3.5 w-3.5" />
                          {formatDate(mainBooking.event.startDate)}
                        </span>
                        {mainBooking.event.startTime && (
                          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                            <Icon name="clock" className="h-3.5 w-3.5" />
                            {mainBooking.event.startTime}
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-950">
                        {mainBooking.event.title}
                      </h3>

                      <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-slate-500">
                        <Icon
                          name="location"
                          className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
                        />
                        {formatLocation(mainBooking.event)}
                      </p>

                      <p className="mt-3 text-sm text-slate-500">
                        {mainBooking.quantity}{" "}
                        {mainBooking.quantity === 1 ? "ticket" : "tickets"} ·{" "}
                        {formatMoney(
                          mainBooking.totalPrice,
                          mainBooking.event.currency,
                        )}
                      </p>
                    </div>

                    <Link
                      href="/user/booking"
                      className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                    >
                      <Icon name="ticket" className="h-4 w-4" />
                      View Ticket
                    </Link>
                  </div>
                </div>
              </article>

              <article className="flex flex-col overflow-hidden rounded-[28px] border border-slate-100 border-b-4 border-b-indigo-500 bg-white p-5 shadow-sm">
                {secondaryBooking?.event ? (
                  <>
                    <div className="relative h-44 overflow-hidden rounded-2xl bg-slate-100">
                      <EventImage
                        event={secondaryBooking.event}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="mt-5 flex-1">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                        {formatDate(secondaryBooking.event.startDate)}
                      </p>
                      <h3 className="mt-2 text-xl font-extrabold leading-snug text-slate-950">
                        {secondaryBooking.event.title}
                      </h3>
                      <p className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                        <Icon
                          name="location"
                          className="mt-0.5 h-4 w-4 shrink-0"
                        />
                        {formatLocation(secondaryBooking.event)}
                      </p>
                    </div>
                    <Link
                      href="/user/booking"
                      className="mt-5 flex w-full items-center justify-center rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      Booking details
                    </Link>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <Icon name="calendar" className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                      Your next event starts here
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Discover experiences and book a place at something you
                      will remember.
                    </p>
                    <Link
                      href="/events"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Find an event <Icon name="arrow" className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </article>
            </div>
          ) : (
            <EmptyState
              title="No upcoming events yet"
              description="When you book an event, it will appear here with its date, location and ticket details."
              actionLabel="Explore events"
              actionHref="/events"
            />
          )}
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your community
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                Organizers You Follow
              </h2>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
              {followedOrganizers.length} Following
            </span>
          </div>

          {followedOrganizers.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {followedOrganizers.map((organizer) => (
                <article
                  key={organizer.id}
                  className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {organizer.organizationLogo || organizer.avatar ? (
                      <img
                        src={
                          organizer.organizationLogo || organizer.avatar || ""
                        }
                        alt={organizer.organizationName || organizer.fullName}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                        {organizer.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900">
                        {organizer.organizationName || organizer.fullName}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {organizer.fullName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {[organizer.city, organizer.country]
                          .filter(Boolean)
                          .join(", ") || "Location unavailable"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/organizer/${organizer.id}`}
                      className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-bold text-white hover:bg-indigo-700"
                    >
                      View Profile
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleUnfollowOrganizer(organizer.id)}
                      disabled={removingOrganizerId === organizer.id}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {removingOrganizerId === organizer.id
                        ? "..."
                        : "Unfollow"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="You aren't following any organizers yet"
              description="Follow organizers whose events interest you. Their profiles will appear here."
              actionLabel="Explore organizers"
              actionHref="/events"
            />
          )}
        </section>

        {/* Saved Events and Booking History */}
        <div className="grid items-start gap-8 lg:grid-cols-3">
          <section className="space-y-5 lg:col-span-2">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Keep them close
                </p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                  Saved Events
                </h2>
              </div>
              <Link
                href="/user/saved-events"
                className="shrink-0 text-sm font-bold text-indigo-600 transition hover:text-indigo-800"
              >
                View all saved
              </Link>
            </div>

            {savedEvents.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {savedEvents.slice(0, 4).map((event) => (
                  <article
                    key={event.id}
                    className="group flex gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Link
                      href={eventHref(event)}
                      className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100"
                      aria-label={`View ${event.title}`}
                    >
                      <EventImage
                        event={event}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <h3 className="line-clamp-2 font-extrabold leading-snug text-slate-900">
                        {event.title}
                      </h3>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <Icon name="calendar" className="h-3.5 w-3.5" />
                        {formatDate(event.startDate)}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {formatLocation(event)}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Link
                          href={eventHref(event)}
                          className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 hover:text-indigo-800"
                        >
                          Book now
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemoveSavedEvent(event.id)}
                          disabled={removingEventId === event.id}
                          className="text-xs font-bold uppercase tracking-wider text-slate-400 transition hover:text-rose-600 disabled:opacity-50"
                        >
                          {removingEventId === event.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No saved events yet"
                description="Save events you are interested in and they will be collected here for easy access."
                actionLabel="Discover events"
                actionHref="/events"
              />
            )}
          </section>

          <section className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Your past experiences
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                Booking History
              </h2>
            </div>

            <div className="space-y-3 rounded-[28px] bg-slate-100 p-4 sm:p-5">
              {historyBookings.length > 0 ? (
                historyBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Icon name="ticket" className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">
                          {booking.event?.title || "Event booking"}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-slate-500">
                          {formatDate(booking.event?.startDate)} ·{" "}
                          {booking.bookingStatus === "CANCELLED"
                            ? "Cancelled"
                            : booking.paymentStatus}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-extrabold text-slate-800">
                      {formatMoney(booking.totalPrice, booking.event?.currency)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-white px-4 py-8 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon name="clock" className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    No booking history yet
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your past bookings will appear here.
                  </p>
                </div>
              )}

              <Link
                href="/user/booking"
                className="flex w-full items-center justify-center gap-2 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 transition hover:text-indigo-700"
              >
                View booking records
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>

        {/* Small account footer */}
        <section className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-extrabold text-indigo-700">
                {initials(user?.fullName || "User")}
              </div>
            )}
            <div>
              <p className="font-extrabold text-slate-900">
                {user?.fullName || "Your account"}
              </p>
              <p className="text-xs text-slate-500">
                Keep your profile and event preferences up to date.
              </p>
            </div>
          </div>
          <Link
            href="/user/profile"
            className="rounded-xl border border-indigo-200 bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-600 hover:text-white"
          >
            Manage profile
          </Link>
        </section>
      </div>
    </main>
  );
}
