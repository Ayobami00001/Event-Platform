"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { graphqlRequest } from "@/lib/graphqlClient";
import { useParams } from "next/navigation";

interface Organizer {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: string;
}

interface EventData {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  category?: string;
  image?: string;
  mode?: string;
  pricing?: string;
  price?: number;
  currency?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  locationName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  totalSeats?: number;
  bookedSeats?: number;
  availableSeats?: number;
  status?: string;
  createdAt?: string;
  organizer?: Organizer;
}

const GET_EVENT_BY_ID = `
query GetEventById($eventId: ID!) {
  getEventById(eventId: $eventId) {
    id
    title
    slug
    description
    category
    image
    mode
    pricing
    price
    currency
    startDate
    endDate
    startTime
    endTime
    locationName
    address
    city
    state
    country
    totalSeats
    bookedSeats
    availableSeats
    status
    createdAt

    organizer {
      id
      fullName
      email
      phone
      avatar
      role
    }
  }
}`;

export default function EventDetailsPage() {
  const [showToast, setShowToast] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const eventId = params.id as string;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data: any = await graphqlRequest({
          query: GET_EVENT_BY_ID,
          variables: { eventId },
        });

        setEventData(data.getEventById);
      } catch (err) {
        console.error("Error fetching event details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="events" role="admin">
        <div className="p-10 flex items-center justify-center text-slate-600 font-medium">
          Loading event details...
        </div>
      </DashboardLayout>
    );
  }

  if (!eventData) {
    return (
      <DashboardLayout title="events" role="admin">
        <div className="p-10 flex items-center justify-center text-slate-600 font-medium">
          Event not found.
        </div>
      </DashboardLayout>
    );
  }

  // Derived Values & Analytics derived directly from GraphQL response
  const totalSeats = eventData.totalSeats || 0;
  const bookedSeats = eventData.bookedSeats || 0;
  const availableSeats =
    eventData.availableSeats ?? Math.max(0, totalSeats - bookedSeats);
  const ticketPrice = eventData.price || 0;
  const grossRevenue = bookedSeats * ticketPrice;
  const selloutPercentage =
    totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  // Dynamically constructed Activity Log from existing timestamp/status
  const activityLogs = [
    {
      id: "status-log",
      label: "Current Status",
      value: eventData.status || "UNKNOWN",
      subtext: "Latest system lifecycle update",
      isCurrent: true,
    },
    {
      id: "created-log",
      label: "Event Created",
      value: eventData.createdAt
        ? new Date(eventData.createdAt).toLocaleDateString()
        : "N/A",
      subtext: "Published on platform",
      isCurrent: false,
    },
  ];

  return (
    <DashboardLayout title="events" role="admin">
      <div className="px-6 lg:px-12 py-10 max-w-7xl mx-auto w-full text-slate-800">
        {/* Breadcrumbs & Title */}
        <div className="mb-8 animate-in fade-in slide-in-from-left duration-700">
          <Link
            href="/admin/events"
            className="inline-flex items-center text-indigo-600 font-semibold hover:gap-2 transition-all gap-1 mb-2 group"
          >
            <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">
              ⮨
            </span>
            Back to Events
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Event Details
          </h1>
        </div>

        {/* Hero Banner Section */}
        <section className="relative h-[400px] w-full rounded-2xl overflow-hidden mb-12 shadow-2xl">
          <img
            src={eventData.image || "/placeholder-event.jpg"}
            alt={eventData.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />

          <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2 mb-4">
                {eventData.category && (
                  <span className="px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/20">
                    {eventData.category}
                  </span>
                )}
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  {eventData.status || "Active"}
                </span>
                {eventData.mode && (
                  <span className="px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/20">
                    {eventData.mode}
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                {eventData.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-slate-300">
                <span className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-sm text-indigo-400">
                    calendar_month
                  </span>
                  {`${new Date(eventData.startDate).toLocaleDateString()} - ${new Date(eventData.endDate).toLocaleDateString()}`}
                </span>
                {eventData.locationName && (
                  <span className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-sm text-indigo-400">
                      location_on
                    </span>
                    {eventData.locationName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="bg-rose-600/80 backdrop-blur-md text-white p-3.5 rounded-2xl font-bold hover:bg-rose-600 transition-all border border-rose-400/30 shadow-lg"
                title="Delete Event"
              >
                <span className="material-symbols-outlined block">delete</span>
              </button>
            </div>
          </div>
        </section>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-8">
            {/* Card 1: Event Info */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  General Information
                </h3>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                  ID: {eventData.id}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed mb-8">
                {eventData.description || "No description provided."}
              </p>
              <div className="grid grid-cols-2 gap-y-6 gap-x-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Event Name
                  </p>
                  <p className="font-semibold text-slate-900">
                    {eventData.title}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Price / Currency
                  </p>
                  <p className="font-semibold text-slate-900">
                    ${Number(ticketPrice).toFixed(2)}{" "}
                    <span className="text-slate-500 font-normal">
                      {eventData.currency || "NGN"}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Event Category
                  </p>
                  <p className="font-semibold text-slate-900">
                    {eventData.category || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Pricing Type
                  </p>
                  <p className="font-semibold text-slate-900">
                    {eventData.pricing || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    {eventData.status || "Active"}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Mode
                  </p>
                  <p className="font-semibold text-slate-900">
                    {eventData.mode || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Date & Location */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-8">
                <span className="w-1.5 h-6 bg-teal-500 rounded-full" />
                <h3 className="text-xl font-bold text-slate-900">
                  Logistics & Venue
                </h3>
              </div>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <span className="material-symbols-outlined block">
                        calendar_today
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Schedule
                      </p>
                      <p className="font-bold text-slate-900 text-lg">
                        {new Date(eventData.startDate).toLocaleDateString()} -{" "}
                        {new Date(eventData.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {eventData.startTime || "00:00"} -{" "}
                        {eventData.endTime || "00:00"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                      <span className="material-symbols-outlined block">
                        meeting_room
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Venue Details
                      </p>
                      <p className="font-bold text-slate-900 text-lg">
                        {eventData.locationName || "Virtual / TBD"}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {eventData.address}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {[eventData.city, eventData.state, eventData.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group shadow-inner">
                  <img
                    src={eventData.image || "/placeholder-event.jpg"}
                    alt={eventData.locationName || "Venue image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-indigo-950/20 group-hover:bg-transparent transition-all pointer-events-none" />
                  <div className="absolute bottom-3 right-3">
                    <button
                      type="button"
                      className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md text-indigo-600 hover:scale-110 transition-transform"
                    >
                      <span className="material-symbols-outlined text-sm block">
                        fullscreen
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 space-y-8">
            {/* Card 3: Organizer */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Organizer
              </h3>
              <div className="flex items-center gap-5 mb-8">
                <img
                  src={eventData.organizer?.avatar || "/avatar.png"}
                  alt={eventData.organizer?.fullName || "Organizer"}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-50 flex-shrink-0 border border-indigo-200"
                />
                <div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {eventData.organizer?.fullName || "Unknown Organizer"}
                  </h4>
                  <p className="text-indigo-600 font-semibold text-sm">
                    {eventData.organizer?.role || "Event Host"}
                  </p>
                </div>
              </div>
              <div className="space-y-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="material-symbols-outlined text-lg text-indigo-500">
                    mail
                  </span>
                  <span className="text-sm font-medium">
                    {eventData.organizer?.email || "No email available"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="material-symbols-outlined text-lg text-indigo-500">
                    call
                  </span>
                  <span className="text-sm font-medium">
                    {eventData.organizer?.phone || "No phone available"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
              >
                View Organizer Profile
              </button>
            </div>

            {/* Card 4: Ticket Analytics */}
            <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl border border-slate-800">
              <h3 className="text-lg font-bold mb-6 text-white">
                Ticket Analytics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Total Seats */}
                <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                      <span className="material-symbols-outlined text-sm block">
                        chair
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Total
                    </span>
                  </div>
                  <p className="text-2xl font-black">{totalSeats}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Capacity Limit
                  </p>
                </div>

                {/* Tickets Sold */}
                <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <span className="material-symbols-outlined text-sm block">
                        local_activity
                      </span>
                    </div>
                    <div className="flex items-center text-emerald-400 text-[10px] font-bold">
                      <span className="material-symbols-outlined text-xs">
                        trending_up
                      </span>
                      {selloutPercentage}%
                    </div>
                  </div>
                  <p className="text-2xl font-black">{bookedSeats}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Tickets Sold
                  </p>
                </div>

                {/* Available Seats */}
                <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                      <span className="material-symbols-outlined text-sm block">
                        event_seat
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Left
                    </span>
                  </div>
                  <p className="text-2xl font-black">{availableSeats}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Available Seats
                  </p>
                </div>

                {/* Gross Revenue */}
                <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                      <span className="material-symbols-outlined text-sm block">
                        payments
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Est.
                    </span>
                  </div>
                  <p className="text-lg font-black">
                    ${grossRevenue.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Gross Revenue
                  </p>
                </div>
              </div>
            </div>

            {/* Card 5: Activity Log */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Activity Log
              </h3>
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                {activityLogs.map((log) => (
                  <div key={log.id} className="relative pl-8">
                    <div
                      className={
                        log.isCurrent
                          ? "absolute left-0 top-1 w-4 h-4 bg-indigo-600 rounded-full ring-4 ring-indigo-100"
                          : "absolute left-1 top-1.5 w-2 h-2 bg-slate-300 rounded-full"
                      }
                    />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {log.label}
                    </p>
                    <p
                      className={
                        log.isCurrent
                          ? "font-bold text-slate-900"
                          : "font-semibold text-slate-700"
                      }
                    >
                      {log.value}
                    </p>
                    <p className="text-[10px] text-slate-400">{log.subtext}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Admin Actions */}
        <section className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 mb-20 animate-in slide-in-from-bottom duration-1000">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                Administrative Control Panel
              </h3>
              <p className="text-slate-500">
                Manage the lifecycle and visibility of this event across the
                platform ecosystem.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
              >
                <span className="material-symbols-outlined text-sm">
                  check_circle
                </span>
                Approve
              </button>
              <button
                type="button"
                className="px-5 py-3 bg-rose-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition-all shadow-md shadow-rose-200"
              >
                <span className="material-symbols-outlined text-sm">
                  cancel
                </span>
                Reject
              </button>
              <button
                type="button"
                className="px-5 py-3 bg-amber-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-all shadow-md shadow-amber-200"
              >
                <span className="material-symbols-outlined text-sm">
                  pause_circle
                </span>
                Suspend
              </button>
              <button
                type="button"
                className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
              >
                <span className="material-symbols-outlined text-sm">
                  refresh
                </span>
                Restore
              </button>
              <button
                type="button"
                className="px-5 py-3 border-2 border-rose-600 text-rose-600 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-50 transition-all"
              >
                <span className="material-symbols-outlined text-sm">
                  delete_forever
                </span>
                Delete Permanent
              </button>
            </div>
          </div>
        </section>

        {/* Toast Notification */}
        <div
          className={`fixed bottom-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 transition-transform duration-500 z-[100] border border-slate-800 ${
            showToast ? "translate-y-0" : "translate-y-32"
          }`}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-sm">info</span>
          </div>
          <div>
            <p className="font-bold text-sm">Viewing Mode</p>
            <p className="text-xs text-slate-400">
              You are currently in administrative review mode.
            </p>
          </div>
          <button
            type="button"
            className="ml-4 text-slate-400 hover:text-white"
            onClick={() => setShowToast(false)}
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}