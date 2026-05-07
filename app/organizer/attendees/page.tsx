import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AttendeesPage() {
  return (
    <DashboardLayout role="organizer" title="Attendee Management">
      <div className="lg:ml-64 p-4 md:p-6 lg:p-8 max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-6">
          Attendee Management
        </h1>

        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm">
              <tr>
                <th className="p-4">Name</th>
                <th>Email</th>
                <th>Event</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {[1, 2].map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="p-4">Marcus Thorne</td>
                  <td>test@email.com</td>
                  <td>Tech Summit</td>
                  <td className="text-green-600">
                    Confirmed
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