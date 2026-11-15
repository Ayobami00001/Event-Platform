"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";

const GET_ALL_EVENTS = `
query {
  getAllEvents {
    id
    title
    category
    status
    startDate
    bookedSeats
    price
    organizer {
      id
      fullName
    }
  }
}
`;

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data: any = await graphqlRequest({
          query: GET_ALL_EVENTS,
        });

        setEvents(data.getAllEvents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="admin" title="Event Management">
        <div className="lg:ml-64 p-8">Loading events...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="events" role="admin">
      <div className="lg:ml-64 p-4 md:p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Event Management
          </h1>
          <p className="mt-2 text-slate-500">
            Review all platform events and their current status.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <table className="w-full text-left">
            <thead className="bg-slate-100/70">
              <tr>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Event
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Date
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Status
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Revenue
                </th>
                <th className="px-8 py-5 text-right text-xs font-bold uppercase tracking-widest text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50">
                  <td className="px-8 py-5 font-bold text-slate-900">
                    <div>
                      <p className="font-bold">{event.title}</p>
                      <p className="text-xs text-slate-500">
                        {event.organizer?.fullName}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-600">
                    {new Date(event.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        event.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : event.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : event.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-800">
                    {event.price ? `$${event.price.toLocaleString()}` : "Free"}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => router.push(`/admin/events/${event.id}`)}
                      className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
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
    </DashboardLayout>
  );
}
