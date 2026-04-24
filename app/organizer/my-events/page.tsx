"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { graphqlRequest } from "@/lib/graphqlClient";
import { GET_MY_EVENTS_QUERY } from "@/graphql/queries";
import { DELETE_EVENT_MUTATION } from "@/graphql/mutations";

type EventItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  startDate: string;
  endDate: string;
  status: string;
  totalSeats: number;
  availableSeats: number;
  image?: string;
  price?: number;
  bookedSeats?: number;
  locationName?: string;
  startTime?: string;
};

export default function MyEventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You must be logged in");
          setLoading(false);
          return;
        }

        const data = await graphqlRequest<{ getMyEvents: EventItem[] }>({
          query: GET_MY_EVENTS_QUERY,
          token,
        });

        setEvents(data.getMyEvents || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const handleDelete = async (eventId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(eventId);
      const token = localStorage.getItem("token");

      await graphqlRequest<{ deleteEvent: string }>({
        query: DELETE_EVENT_MUTATION,
        variables: { eventId },
        token: token || "",
      });

      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
    } finally {
      setDeletingId("");
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "UPCOMING":
      case "ONGOING":
        return "bg-emerald-100 text-emerald-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "COMPLETED":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.category.toLowerCase().includes(search.toLowerCase()) ||
        (event.locationName || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  return (
    <main className="min-h-screen bg-slate-50">
      <Sidebar role="organizer" />
      <Topbar title="My Events" />

      <div className="lg:ml-64 pt-24 px-6 pb-12 md:px-10">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <nav className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              <span>Events</span>
              <span>›</span>
              <span className="text-indigo-600">My Listings</span>
            </nav>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Manage Events
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Review your event listings, track availability, and manage updates
              from one clean dashboard.
            </p>
          </div>

          <button
            onClick={() => router.push("/organizer/create-event")}
            className="rounded-2xl bg-indigo-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:scale-[1.01] hover:bg-indigo-700"
          >
            + Create New Event
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search event name, category or venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-slate-100 py-3 pl-4 pr-4 text-sm outline-none ring-0 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-xl bg-slate-100 py-3 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredEvents.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-900">{events.length}</span>{" "}
            events
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-slate-500">Loading events...</div>
          ) : error ? (
            <div className="p-8 text-red-600">{error}</div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-xl font-bold text-slate-900">
                No matching events found
              </h3>
              <p className="mt-2 text-slate-500">
                Try changing your search or create a new event.
              </p>
              <button
                onClick={() => router.push("/organizer/create-event")}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Create Event
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Event Details
                    </th>
                    <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Date & Time
                    </th>
                    <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Ticket Sales
                    </th>
                    <th className="px-6 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Revenue
                    </th>
                    <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map((event) => {
                    const bookedSeats =
                      typeof event.bookedSeats === "number"
                        ? event.bookedSeats
                        : event.totalSeats - event.availableSeats;

                    const soldPercent =
                      event.totalSeats > 0
                        ? Math.min(
                            100,
                            Math.round((bookedSeats / event.totalSeats) * 100)
                          )
                        : 0;

                    const revenue =
                      (event.price && event.price > 0 ? event.price : 0) *
                      bookedSeats;

                    return (
                      <tr
                        key={event.id}
                        className="group transition-colors hover:bg-slate-50/80"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 to-slate-100 text-lg font-bold text-indigo-600 shadow-sm">
                              {event.image ? (
                                <img
                                  src={event.image}
                                  alt={event.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                event.title.charAt(0).toUpperCase()
                              )}
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                                {event.title}
                              </h4>
                              <p className="mt-1 text-xs text-slate-500">
                                {event.locationName || "Venue not set"}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {event.category}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-6">
                          <div className="text-sm font-semibold text-slate-700">
                            {formatDate(event.startDate)}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-400">
                            {event.startTime || "Time not set"}
                          </div>
                        </td>

                        <td className="px-6 py-6">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusClass(
                              event.status
                            )}`}
                          >
                            {event.status}
                          </span>
                        </td>

                        <td className="px-6 py-6">
                          <div className="flex max-w-[150px] flex-col gap-1.5">
                            <div className="flex items-end justify-between">
                              <span className="text-sm font-bold text-slate-900">
                                {bookedSeats}/{event.totalSeats}
                              </span>
                              <span className="text-[10px] font-bold text-indigo-600">
                                {soldPercent}%
                              </span>
                            </div>

                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-indigo-600"
                                style={{ width: `${soldPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-6 text-right">
                          <div className="text-sm font-bold text-slate-900">
                            {revenue > 0 ? `$${revenue.toLocaleString()}` : "$0"}
                          </div>
                          <div className="mt-1 text-[10px] font-bold text-slate-400">
                            {event.price && event.price > 0 ? "Paid Event" : "Free Event"}
                          </div>
                        </td>

                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(`/organizer/edit-event/${event.id}`)
                              }
                              className="rounded-xl px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(event.id)}
                              disabled={deletingId === event.id}
                              className="rounded-xl p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              {deletingId === event.id ? "..." : "🗑️"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && filteredEvents.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-8 py-5">
              <p className="text-xs font-medium text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {filteredEvents.length}
                </span>{" "}
                event{filteredEvents.length > 1 ? "s" : ""}
              </p>

              <button
                onClick={() => router.push("/organizer/create-event")}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Add Another Event
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}