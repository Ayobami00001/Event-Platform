"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({
  children,
  role = "user",
  title,
}: {
  children: React.ReactNode;
  role?: "user" | "organizer" | "admin";
  title: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Topbar
        title={title}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* KEY FIX HERE */}
      <div className="lg:ml-64 pt-20 p-4 md:p-6 lg:p-8">
        {children}
      </div>
    </main>
  );
}