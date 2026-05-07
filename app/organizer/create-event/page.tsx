"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateEventForm from "@/components/forms/CreateEventForm";

export default function CreateEventPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="bg-slate-50 min-h-screen">
      <Sidebar
        role="organizer"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Topbar
        title="Create Event"
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="lg:ml-64 p-4 md:p-6 lg:p-8 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
          Create New Event
        </h1>

        <p className="text-slate-500 mb-6 md:mb-8">
          Curate an unforgettable experience
        </p>

        <CreateEventForm />
      </div>
    </main>
  );
}