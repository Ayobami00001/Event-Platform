"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";
import EventDetailApproval from "@/components/dashboard/EventDetailApproval";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const GET_EVENT_BY_ID = `
  query GetEventById($eventId: ID!) {
  getEventById(eventId: $eventId) {
    id
    title
    description
    category
    mode
    image
    startDate
    startTime
    locationName
    address
    city
    state
    country
    onlineLink
    availableSeats
    price
    status

    organizer {
      id
      fullName
      email
      avatar
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

export default function Page() {
  const params = useParams();
  const router = useRouter();

  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data: any = await graphqlRequest({
          query: GET_EVENT_BY_ID,
          variables: {
            eventId,
          },
        });

        setEvent(data.getEventById);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleApprove = async (id: string) => {
    try {
      await graphqlRequest({
        query: APPROVE_EVENT,
        variables: {
          eventId: id,
        },
      });

      router.push("/admin/approvals");
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await graphqlRequest({
        query: REJECT_EVENT,
        variables: {
          eventId: id,
        },
      });

      router.push("/admin/approvals");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin" title="Event Submission">
        <div className="lg:ml-64 p-8">Loading event...</div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout role="admin" title="Event Submission">
        <div className="lg:ml-64 p-8">Event not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" title="Event Submission">
      <div className="lg:ml-64">
        <EventDetailApproval
          event={event}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </DashboardLayout>
  );
}
