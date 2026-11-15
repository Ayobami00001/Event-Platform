"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { graphqlRequest } from "@/lib/graphqlClient";

const GET_MY_EVENTS = `
  query {
    getMyEvents {
      id
      title
    }
  }
`;

const GET_EVENT_ATTENDEES = `
  query GetEventAttendees($eventId: ID!) {
    getEventAttendees(eventId: $eventId) {
      id
      quantity
      bookingStatus
      paymentStatus
      totalPrice
      createdAt

      tickets {
        id
        ticketCode
        checkedInAt
      }

      user {
        id
        fullName
        email
      }

      event {
        id
        title
      }
    }
  }
`;

export default function AttendeesPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data: any = await graphqlRequest({
          query: GET_MY_EVENTS,
        });

        setEvents(data.getMyEvents);

        if (data.getMyEvents.length > 0) {
          setSelectedEvent(data.getMyEvents[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const fetchAttendees = async () => {
    if (!selectedEvent) {
      setAttendees([]);
      return;
    }

    try {
      setLoadingAttendees(true);

      const data = await graphqlRequest<{
        getEventAttendees: any[];
      }>({
        query: GET_EVENT_ATTENDEES,
        variables: { eventId: selectedEvent },
      });

      setAttendees(data.getEventAttendees ?? []);
    } catch (error) {
      console.error("Failed to load attendees:", error);
      alert("Unable to refresh attendees.");
    } finally {
      setLoadingAttendees(false);
    }
  };

  useEffect(() => {
  if (!selectedEvent) return;

  void fetchAttendees();

  const interval = setInterval(() => {
    void fetchAttendees();
  }, 15000);

  return () => clearInterval(interval);
}, [selectedEvent]);

  const filteredAttendees = useMemo(() => {
    return attendees.filter((booking) => {
      const matchesSearch =
        booking.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        booking.user.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || booking.bookingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [attendees, search, statusFilter]);

  const totalBookings = filteredAttendees.length;

  const confirmedAttendees = filteredAttendees
    .filter((booking) => booking.bookingStatus === "CONFIRMED")
    .reduce((sum, booking) => sum + booking.quantity, 0);

  const pendingAttendees = filteredAttendees
    .filter((booking) => booking.bookingStatus === "PENDING")
    .reduce((sum, booking) => sum + booking.quantity, 0);

  const checkedInAttendees = filteredAttendees.reduce(
    (sum, booking) =>
      sum +
      (booking.tickets?.filter((ticket: any) => Boolean(ticket.checkedInAt))
        .length || 0),
    0,
  );

  const revenue = filteredAttendees
    .filter((booking) => booking.paymentStatus === "PAID")
    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

  const exportCSV = () => {
    if (filteredAttendees.length === 0) {
      alert("No attendee records available to export.");
      return;
    }

    const headers = [
      "Booking ID",
      "Full Name",
      "Email",
      "Event",
      "Quantity",
      "Booking Status",
      "Payment Status",
      "Total Price (NGN)",
      "Checked In",
      "Booking Date",
    ];

    const rows = filteredAttendees.map((booking) => [
      booking.id,
      booking.user?.fullName ?? "",
      booking.user?.email ?? "",
      booking.event?.title ?? "",
      booking.quantity,
      booking.bookingStatus,
      booking.paymentStatus,
      booking.totalPrice,
      booking.tickets?.filter((ticket: any) => ticket.checkedInAt).length ?? 0,
      booking.createdAt,
    ]);

    // Escape CSV values and prevent spreadsheet formula injection.
    const escapeCSV = (value: unknown) => {
      let text = String(value ?? "");

      if (/^[\s]*[=+\-@]/.test(text)) {
        text = `'${text}`;
      }

      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `concierge-attendees-${selectedEvent}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout role="organizer" title="Attendee Management">
      <div className="lg:ml-64 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Attendee Management</h1>
            <p className="mt-2 text-slate-500">
              Manage attendees, monitor bookings, and track event participation.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              disabled={filteredAttendees.length === 0}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium shadow-sm"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => void fetchAttendees()}
              disabled={loadingAttendees || !selectedEvent}
              className="rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              {loadingAttendees ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Event Selection */}
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Event
              </label>

              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search attendee..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <option>All</option>
                <option>CONFIRMED</option>
                <option>PENDING</option>
                <option>CANCELLED</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
                className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Bookings",
              value: totalBookings,
              color: "from-indigo-600 to-indigo-400",
            },
            {
              label: "Confirmed",
              value: confirmedAttendees,
              color: "from-emerald-600 to-emerald-400",
            },
            {
              label: "Pending",
              value: pendingAttendees,
              color: "from-amber-600 to-amber-400",
            },
            {
              label: "Checked In",
              value: checkedInAttendees,
              color: "from-sky-600 to-sky-400",
            },
            {
              label: "Revenue",
              value: new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(revenue),
              color: "from-amber-600 to-yellow-400",
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-3xl bg-gradient-to-r ${card.color} p-6 text-white shadow-sm`}
            >
              <p className="text-sm opacity-80">{card.label}</p>
              <h2 className="mt-2 text-4xl font-black">{card.value}</h2>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-bold">Event Attendees</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-4">Attendee</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>Tickets</th>
                  <th>Booking</th>
                  <th>Payment</th>
                  <th>Check-In</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendees.map((booking) => (
                  <tr key={booking.id} className="border-t border-slate-100">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{booking.user.fullName}</p>

                        <p className="text-xs text-slate-500">
                          #{booking.id.slice(-6)}
                        </p>
                      </div>
                    </td>

                    <td>{booking.user.email}</td>

                    <td>{booking.event.title}</td>

                    <td>{booking.quantity}</td>

                    <td>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {booking.bookingStatus}
                      </span>
                    </td>

                    <td>
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {booking.paymentStatus}
                      </span>
                    </td>

                    <td>
                      {booking.bookingStatus === "CANCELLED" ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          Cancelled
                        </span>
                      ) : booking.tickets?.some((ticket: any) =>
                          Boolean(ticket.checkedInAt),
                        ) ? (
                        <div>
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            {
                              booking.tickets.filter((ticket: any) =>
                                Boolean(ticket.checkedInAt),
                              ).length
                            }{" "}
                            / {booking.quantity} Checked In
                          </span>
                        </div>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Not Checked In
                        </span>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {!loadingAttendees && filteredAttendees.length === 0 && (
        <div className="py-16 text-center">
          <h3 className="text-xl font-bold">No attendees found</h3>

          <p className="mt-2 text-slate-500">This event has no bookings yet.</p>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-details-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 id="booking-details-title" className="text-2xl font-bold">
                Booking Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
                className="rounded-full bg-slate-100 px-4 py-2 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <strong>Customer:</strong> {selectedBooking.user?.fullName}
              </p>

              <p>
                <strong>Email:</strong> {selectedBooking.user?.email}
              </p>

              <p>
                <strong>Event:</strong> {selectedBooking.event?.title}
              </p>

              <p>
                <strong>Tickets Purchased:</strong> {selectedBooking.quantity}
              </p>

              <p>
                <strong>Booking Status:</strong> {selectedBooking.bookingStatus}
              </p>

              <p>
                <strong>Payment Status:</strong> {selectedBooking.paymentStatus}
              </p>

              <p>
                <strong>Booking Reference:</strong> {selectedBooking.id}
              </p>

              <div className="border-t pt-5">
                <h3 className="mb-4 text-lg font-bold">Individual Tickets</h3>

                {selectedBooking.tickets?.length ? (
                  <div className="space-y-3">
                    {selectedBooking.tickets.map(
                      (ticket: any, index: number) => (
                        <div
                          key={ticket.id}
                          className="rounded-xl bg-slate-50 p-4"
                        >
                          <p className="font-semibold">Ticket {index + 1}</p>

                          <p className="mt-1 break-all text-xs text-slate-600">
                            {ticket.ticketCode}
                          </p>

                          <span
                            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                              ticket.checkedInAt
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {ticket.checkedInAt
                              ? "Checked In"
                              : "Not Checked In"}
                          </span>

                          {ticket.checkedInAt && (
                            <p className="mt-2 text-xs text-slate-500">
                              Checked in:{" "}
                              {new Date(ticket.checkedInAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500">
                    No tickets have been issued for this booking.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
