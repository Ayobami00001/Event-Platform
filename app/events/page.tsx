import { Suspense } from "react";
import EventsPageClient from "@/components/events/EventsPageClient";

export default function EventsPage() {
  return (
    <Suspense fallback={<p>Loading events...</p>}>
      <EventsPageClient />
    </Suspense>
  );
}