"use client";
import { use, useState } from "react";


// ─── Types ────────────────────────────────────────────────────────────────────

interface Organizer {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  mode: "ONLINE" | "PHYSICAL" | "HYBRID";
  image: string | null;
  startDate: string;
  startTime: string;
  locationName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  onlineLink: string | null;
  availableSeats: number;
  price: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  organizer: Organizer;
  organizerId: string;
}

interface EventDetailApprovalProps {
  event: Event;
  onApprove: (id: string) => Promise<void> | void;
  onReject: (id: string) => Promise<void> | void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  Event["status"],
  { label: string; classes: string }
> = {
  PENDING: {
    label: "Pending Review",
    classes: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  APPROVED: {
    label: "Approved",
    classes: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    classes: "bg-red-100 text-red-700 border border-red-200",
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  Music: "🎵",
  Tech: "💻",
  Sports: "⚽",
  "Online Events": "🌐",
  "Arts & Culture": "🎨",
  "Food & Drink": "🍽️",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatPrice(price: number): string {
  return price === 0 ? "Free" : `$${price.toFixed(2)}`;
}

function buildLocation(event: Event): string {
  if (event.mode === "ONLINE") return "Online";
  const parts = [
    event.locationName,
    event.address,
    event.city,
    event.state,
    event.country,
  ].filter(Boolean);
  return parts.join(", ") || "Location TBD";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function OrganizerCard({ organizer }: { organizer: Organizer }) {
  const initials = organizer.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
      {organizer.avatar ? (
        <img
          src={organizer.avatar}
          alt={organizer.fullName}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100 flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">
          {organizer.fullName}
        </p>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {organizer.email}
        </p>
      </div>
      <span className="ml-auto flex-shrink-0 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
        Organizer
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventDetailApproval({
  event,
  onApprove,
  onReject,
}: EventDetailApprovalProps) {

     if (!event) {
    return (
      <div className="p-8">
        Loading event...
      </div>
    );
  }

  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const status = STATUS_STYLES[event.status];
  const categoryIcon = CATEGORY_ICONS[event.category] ?? "📌";
  const location = buildLocation(event);
  const isPending = event.status === "PENDING";

  async function handleApprove() {
    setApproveLoading(true);
    try {
      await onApprove(event.id);
    } finally {
      setApproveLoading(false);
    }
  }

  async function handleReject() {
    setRejectLoading(true);
    try {
      await onReject(event.id);
    } finally {
      setRejectLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page wrapper ─────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* ── 1. Event Banner ─────────────────────────────────────── */}
          <div className="relative w-full h-64 bg-gray-900 overflow-hidden">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-700 to-violet-700">
                <span className="text-6xl opacity-40">🎪</span>
              </div>
            )}
            {/* Mode pill overlay */}
            <span className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm tracking-wide uppercase">
              {event.mode}
            </span>
          </div>

          {/* ── Content area ────────────────────────────────────────── */}
          <div className="p-6 space-y-6">

            {/* ── 2. Title ──────────────────────────────────────────── */}
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
                {event.title}
              </h1>

              {/* ── 3. Category ─────────────────────────────────────── */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  <span>{categoryIcon}</span>
                  {event.category}
                </span>

                {/* ── 4. Status Badge ──────────────────────────────── */}
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${status.classes}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      event.status === "APPROVED"
                        ? "bg-emerald-500"
                        : event.status === "REJECTED"
                        ? "bg-red-500"
                        : "bg-amber-500"
                    }`}
                  />
                  {status.label}
                </span>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* ── 5. Description ────────────────────────────────────── */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                About this Event
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* ── 6. Date / Time / Location / Price / Seats ─────────── */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Details
              </h2>
              <div className="divide-y divide-gray-100">
                <MetaItem
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  label="Date"
                  value={formatDate(event.startDate)}
                />
                <MetaItem
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                  label="Time"
                  value={formatTime(event.startTime)}
                />
                <MetaItem
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  }
                  label="Location"
                  value={location}
                />
                <MetaItem
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                  label="Price"
                  value={formatPrice(event.price)}
                />
                <MetaItem
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  }
                  label="Available Seats"
                  value={`${event.availableSeats} seats`}
                />
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* ── 7. Organizer Card ─────────────────────────────────── */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Organizer
              </h2>
              <OrganizerCard organizer={event.organizer} />
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* ── 8 & 9. Approve / Reject Buttons ──────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {/* Approve */}
              <button
                onClick={handleApprove}
                disabled={!isPending || approveLoading || rejectLoading}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-150
                  ${
                    isPending
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-md shadow-indigo-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {approveLoading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      />
                    </svg>
                    Approving…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Approve Event
                  </>
                )}
              </button>

              {/* Reject */}
              <button
                onClick={handleReject}
                disabled={!isPending || rejectLoading || approveLoading}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-150 border-2
                  ${
                    isPending
                      ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 active:scale-[0.98]"
                      : "border-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {rejectLoading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      />
                    </svg>
                    Rejecting…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Reject Event
                  </>
                )}
              </button>
            </div>

            {/* Already actioned note */}
            {!isPending && (
              <p className="text-center text-xs text-gray-400 -mt-2">
                This event has already been{" "}
                <span
                  className={
                    event.status === "APPROVED"
                      ? "text-emerald-600 font-semibold"
                      : "text-red-500 font-semibold"
                  }
                >
                  {event.status.toLowerCase()}
                </span>
                . No further action is available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Usage example with GraphQL ──────────────────────────────────────────────
//
// import { useQuery, gql, useMutation } from "@apollo/client";
//
// const GET_EVENT_BY_ID = gql`
//   query GetEventById($id: ID!) {
//     getEventById(id: $id) {
//       id title description category mode image
//       startDate startTime locationName address city state country
//       onlineLink availableSeats price status
//       organizer { id fullName email avatar }
//     }
//   }
// `;
//
// const APPROVE_EVENT = gql`mutation ApproveEvent($id: ID!) { approveEvent(id: $id) { id status } }`;
// const REJECT_EVENT  = gql`mutation RejectEvent($id: ID!)  { rejectEvent(id: $id)  { id status } }`;
//
// function EventApprovalPage({ eventId }: { eventId: string }) {
//   const { data, loading } = useQuery(GET_EVENT_BY_ID, { variables: { id: eventId } });
//   const [approve] = useMutation(APPROVE_EVENT, { refetchQueries: [GET_EVENT_BY_ID] });
//   const [reject]  = useMutation(REJECT_EVENT,  { refetchQueries: [GET_EVENT_BY_ID] });
//   if (loading || !data) return <div>Loading…</div>;
//   return (
//     <EventDetailApproval
//       event={data.getEventById}
//       onApprove={(id) => approve({ variables: { id } })}
//       onReject={(id)  => reject({ variables:  { id } })}
//     />
//   );
// }