"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/common/Navbar";

type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image: string | null;
  startDate: string | null;
  city: string | null;
  country: string | null;
  mode: "ONLINE" | "PHYSICAL";
  pricing: "FREE" | "PAID";
  price: number | null;
  currency: string | null;
};

type PublicOrganizer = {
  id: string;
  fullName: string;
  avatar: string | null;
  organizationName: string | null;
  organizationLogo: string | null;
  organizationDescription: string | null;
  organizationWebsite: string | null;
  organizerBio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  createdAt: string | null;
  followerCount: number;
  isFollowing: boolean;
  events: PublicEvent[];
};

type GraphQLResult<T> = {
  data?: T;
  errors?: { message: string }[];
};

const PUBLIC_ORGANIZER = `
  query PublicOrganizerProfile($organizerId: ID!) {
    publicOrganizerProfile(organizerId: $organizerId) {
      id fullName avatar organizationName organizationLogo
      organizationDescription organizationWebsite organizerBio
      city state country createdAt followerCount isFollowing
      events {
        id slug title description image startDate city country
        mode pricing price currency
      }
    }
  }
`;

const FOLLOW = `
  mutation FollowOrganizer($organizerId: ID!) {
    followOrganizer(organizerId: $organizerId)
  }
`;

const UNFOLLOW = `
  mutation UnfollowOrganizer($organizerId: ID!) {
    unfollowOrganizer(organizerId: $organizerId)
  }
`;

async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const result: GraphQLResult<T> = await response.json();
  if (!response.ok || result.errors?.length || !result.data) {
    throw new Error(result.errors?.[0]?.message || "Unable to complete your request.");
  }
  return result.data;
}

function getViewer(): { id?: string; role?: string } | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    const decoded = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function formatDate(value: string | null) {
  if (!value) return "Date to be announced";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date to be announced"
    : date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function locationText(organizer: PublicOrganizer) {
  return [organizer.city, organizer.state, organizer.country].filter(Boolean).join(", ");
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function PublicOrganizerProfilePage() {
  const params = useParams<{ id: string }>();
  const organizerId = params.id;
  const router = useRouter();
  const [organizer, setOrganizer] = useState<PublicOrganizer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followError, setFollowError] = useState("");
  const [pending, setPending] = useState(false);
  const [viewer, setViewer] = useState<{ id?: string; role?: string } | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const load = useCallback(async () => {
    if (!organizerId) return;
    const data = await graphqlRequest<{ publicOrganizerProfile: PublicOrganizer }>(
      PUBLIC_ORGANIZER,
      { organizerId },
    );
    setOrganizer(data.publicOrganizerProfile);
  }, [organizerId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setOrganizer(null);
    setViewer(getViewer());
    graphqlRequest<{ publicOrganizerProfile: PublicOrganizer }>(PUBLIC_ORGANIZER, {
      organizerId,
    })
      .then((data) => {
        if (!cancelled) setOrganizer(data.publicOrganizerProfile);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [organizerId]);

  async function toggleFollow() {
    if (!organizer || pending) return;
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    if (viewer?.role !== "USER") {
      setFollowError("Only attendee accounts can follow organizers.");
      return;
    }

    setPending(true);
    setFollowError("");
    const previouslyFollowing = organizer.isFollowing;
    setOrganizer((current) =>
      current
        ? {
            ...current,
            isFollowing: !previouslyFollowing,
            followerCount: Math.max(0, current.followerCount + (previouslyFollowing ? -1 : 1)),
          }
        : current,
    );

    try {
      const result = await graphqlRequest<Record<string, boolean>>(
        previouslyFollowing ? UNFOLLOW : FOLLOW,
        { organizerId: organizer.id },
      );
      if (!result[previouslyFollowing ? "unfollowOrganizer" : "followOrganizer"]) {
        throw new Error("Follow request was not completed.");
      }
      // Refresh from the database so the button and count stay accurate.
      await load();
    } catch (err) {
      setOrganizer((current) =>
        current
          ? {
              ...current,
              isFollowing: previouslyFollowing,
              followerCount: Math.max(0, current.followerCount + (previouslyFollowing ? 1 : -1)),
            }
          : current,
      );
      setFollowError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  const today = Date.now();
  const visibleEvents = (organizer?.events || []).filter((event) => {
    const date = event.startDate ? new Date(event.startDate).getTime() : NaN;
    if (Number.isNaN(date)) return tab === "upcoming";
    return tab === "upcoming" ? date >= today : date < today;
  });
  const upcomingCount = (organizer?.events || []).filter(
    (event) => !event.startDate || new Date(event.startDate).getTime() >= today,
  ).length;
  const pastCount = (organizer?.events.length || 0) - upcomingCount;

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-10">
        {loading ? (
          <div className="space-y-6 animate-pulse" aria-label="Loading organizer profile">
            <div className="h-72 rounded-[2rem] bg-slate-200" />
            <div className="h-44 rounded-[2rem] bg-white" />
            <div className="h-64 rounded-[2rem] bg-white" />
          </div>
        ) : error || !organizer ? (
          <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm">
            <h1 className="text-2xl font-extrabold">Organizer not available</h1>
            <p className="mt-3 text-sm text-slate-500">{error || "The requested organizer was not found."}</p>
            <Link href="/events" className="mt-6 inline-block rounded-full bg-indigo-700 px-6 py-3 text-sm font-semibold text-white">
              Explore events
            </Link>
          </div>
        ) : (
          <>
            <section aria-label="Organizer header" className="relative">
              <div className="relative h-64 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-indigo-700 to-violet-500 sm:h-80">
                <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[54px] border-white/10" />
                <div className="absolute bottom-[-7rem] left-[12%] h-80 w-80 rounded-full border-[52px] border-white/10" />
                <div className="absolute bottom-7 left-8 max-w-xl text-sm font-semibold tracking-[0.24em] text-indigo-100/80">EVENT ORGANIZER</div>
              </div>
              <div className="relative mx-3 -mt-16 flex flex-col justify-between gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_24px_55px_-28px_rgba(34,38,75,.28)] sm:mx-6 sm:flex-row sm:items-end sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                  <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-indigo-100 text-5xl font-extrabold text-indigo-700 shadow-xl sm:h-36 sm:w-36">
                    {organizer.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={organizer.avatar} alt={`${organizer.fullName}'s avatar`} className="h-full w-full object-cover" />
                    ) : (
                      organizer.fullName.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="pb-1">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700">Event Host</span>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{organizer.fullName}</h1>
                    {organizer.organizationName && <p className="mt-2 font-semibold text-indigo-700">{organizer.organizationName}</p>}
                    {locationText(organizer) && <p className="mt-2 text-sm text-slate-500">📍 {locationText(organizer)}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  {viewer?.id === organizer.id ? (
                    <Link href="/organizer/profile" className="rounded-full bg-indigo-700 px-7 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-800">Edit your profile</Link>
                  ) : (
                    <button
                      type="button"
                      onClick={toggleFollow}
                      disabled={pending}
                      aria-pressed={organizer.isFollowing}
                      className={`rounded-full px-7 py-3 text-sm font-bold shadow-md transition disabled:opacity-60 ${organizer.isFollowing ? "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : "bg-indigo-700 text-white hover:bg-indigo-800"}`}
                    >
                      {pending ? "Updating…" : organizer.isFollowing ? "✓ Following · Unfollow" : "+ Follow Organizer"}
                    </button>
                  )}
                  {followError && <p role="alert" className="max-w-xs text-xs text-red-600">{followError}</p>}
                </div>
              </div>
            </section>

            <section aria-label="Organizer metrics" className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {[
                { label: "Followers", value: organizer.followerCount.toLocaleString(), icon: "♥" },
                { label: "Published events", value: organizer.events.length.toLocaleString(), icon: "▣" },
                { label: "Upcoming events", value: upcomingCount.toLocaleString(), icon: "✦" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
                  <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>{metric.label}</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-lg text-indigo-700">{metric.icon}</span>
                  </div>
                  <p className="text-3xl font-extrabold tracking-tight text-slate-900">{metric.value}</p>
                </div>
              ))}
            </section>

            <div className="mt-8 grid gap-8 lg:grid-cols-12">
              <div className="space-y-8 lg:col-span-8">
                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-2xl font-extrabold tracking-tight">About the Organizer</h2>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
                    {organizer.organizerBio || organizer.organizationDescription || "This organizer hasn't added a biography yet."}
                  </p>
                  {organizer.organizerBio && organizer.organizationDescription && (
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{organizer.organizationDescription}</p>
                  )}
                </section>

                <section>
                  <div className="mb-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setTab("upcoming")} className={`rounded-full px-5 py-2.5 text-sm font-bold ${tab === "upcoming" ? "bg-indigo-700 text-white" : "bg-white text-slate-600"}`}>
                      Upcoming Events ({upcomingCount})
                    </button>
                    <button type="button" onClick={() => setTab("past")} className={`rounded-full px-5 py-2.5 text-sm font-bold ${tab === "past" ? "bg-indigo-700 text-white" : "bg-white text-slate-600"}`}>
                      Past Events ({pastCount})
                    </button>
                  </div>
                  {visibleEvents.length === 0 ? (
                    <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
                      {tab === "upcoming" ? "No upcoming events have been published yet." : "No past events to show yet."}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {visibleEvents.map((event) => (
                        <article key={event.id} className="flex flex-col gap-5 overflow-hidden rounded-3xl bg-white p-4 shadow-sm sm:flex-row sm:p-5">
                          <div className="h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-tr from-indigo-800 to-violet-400 sm:h-48 sm:w-56">
                            {event.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="flex flex-1 flex-col justify-between gap-4 py-1">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">{formatDate(event.startDate)} · {event.mode === "ONLINE" ? "Online" : [event.city, event.country].filter(Boolean).join(", ") || "Physical event"}</p>
                              <h3 className="mt-2 text-lg font-extrabold">{event.title}</h3>
                              {event.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{event.description}</p>}
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-bold text-slate-900">{event.pricing === "FREE" ? "Free" : event.price != null ? `${event.currency || "NGN"} ${event.price.toLocaleString()}` : "Paid event"}</span>
                              <Link href={`/events/${event.slug}`} className="rounded-full bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-800">View Event →</Link>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <aside className="space-y-6 lg:col-span-4">
                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-extrabold">Organization Details</h2>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-indigo-50 text-xl font-extrabold text-indigo-700">
                      {organizer.organizationLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={organizer.organizationLogo} alt="Organization logo" className="h-full w-full object-cover" />
                      ) : (
                        (organizer.organizationName || organizer.fullName).slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold">{organizer.organizationName || "Independent organizer"}</p>
                      <p className="text-xs text-slate-500">Event organizer</p>
                    </div>
                  </div>
                  {organizer.organizationWebsite && /^https?:\/\//i.test(organizer.organizationWebsite) && (
                    <a href={organizer.organizationWebsite} target="_blank" rel="noopener noreferrer" className="mt-5 block break-all rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
                      🌐 Visit organization website ↗
                    </a>
                  )}
                  {locationText(organizer) && <p className="mt-4 text-sm text-slate-500">📍 {locationText(organizer)}</p>}
                  {organizer.createdAt && <p className="mt-3 text-sm text-slate-500">Hosting since {new Date(organizer.createdAt).getFullYear()}</p>}
                </section>
                <section className="rounded-3xl bg-gradient-to-br from-indigo-800 to-indigo-600 p-7 text-white shadow-sm">
                  <h2 className="text-lg font-extrabold">Discover more experiences</h2>
                  <p className="mt-3 text-sm leading-6 text-indigo-100">Browse events and discover organizers creating experiences you'll love.</p>
                  <Link href="/events" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-xs font-extrabold text-indigo-700">Explore Events →</Link>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
