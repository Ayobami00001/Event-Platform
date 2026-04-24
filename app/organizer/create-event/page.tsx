import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import CreateEventForm from "@/components/forms/CreateEventForm";

export default function CreateEventPage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <Sidebar role="organizer" />
      <Topbar title="Create Event" />

      <div className="ml-64 p-8 max-w-5xl">
        <h1 className="text-4xl font-extrabold mb-2">
          Create New Event
        </h1>
        <p className="text-slate-500 mb-8">
          Curate an unforgettable experience
        </p>

        <CreateEventForm />
      </div>
    </main>
  );
}