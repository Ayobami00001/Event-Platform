"use client";

import ApprovalCard from "@/components/dashboard/ApprovalCard";
import { useEffect, useState } from "react";
import { graphqlRequest } from "@/lib/graphqlClient";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const GET_PENDING_EVENTS = `
  query {
    getPendingEvents {
      id
      title
      category
      startDate
      startTime
      locationName
      image
      mode
      organizer {
        fullName
      }
    }
  }
`;

const APPROVE_EVENT = `
  mutation ApproveEvent($eventId: ID!) {
    approveEvent(eventId: $eventId) {
      id
      status
    }
  }
`;

const REJECT_EVENT = `
  mutation RejectEvent($eventId: ID!) {
    rejectEvent(eventId: $eventId) {
      id
      status
    }
  }
`;

export default function AdminApprovalsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      router.push("/admin/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    const fetchPendingEvents = async () => {
      try {
        const data: any = await graphqlRequest({
          query: GET_PENDING_EVENTS,
        });

        setEvents(data.getPendingEvents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEvents();
  }, []);

  if (loading) {
    return <p className="p-8">Loading approvals...</p>;
  }

  const handleApprove = async (eventId: string) => {
    try {
      await graphqlRequest({
        query: APPROVE_EVENT,
        variables: { eventId },
      });

      // remove from UI
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      await graphqlRequest({
        query: REJECT_EVENT,
        variables: { eventId },
      });

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout title="approvals" role="admin">
      <div className="lg:ml-64 p-4 md:p-6 lg:p-8 max-w-5xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Event Approvals
            </h1>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              {events.length} Pending Submissions
            </span>
          </div>

          <p className="max-w-2xl text-lg text-slate-500">
            Review and manage upcoming experiences from organizers before they
            go live on the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {events.map((event: any) => (
            <ApprovalCard
              key={event.id}
              event={{
                id: event.id,
                title: event.title,
                category: event.category,
                mode: event.mode,
                date: `${new Date(event.startDate).toLocaleDateString()} ${
                  event.startTime || ""
                }`,
                organizer: event.organizer?.fullName || "Unknown",
                image: event.image,
                status: "Pending Review",
              }}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
