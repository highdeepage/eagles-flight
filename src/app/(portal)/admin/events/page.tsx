import { requireAdmin } from "@/lib/auth/session";
import { listAllEvents, listEventTypes } from "@/lib/events/queries";
import { Card, CardBody, CardHeader, Empty } from "@/components/ui";
import { Calendar } from "lucide-react";
import { EventForm } from "./EventForm";
import { EventRow } from "./EventRow";

export const metadata = { title: "Events — Admin" };

export default async function EventsAdminPage() {
  await requireAdmin();
  const [events, types] = await Promise.all([listAllEvents(), listEventTypes()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Events</h1>
        <p className="mt-1 text-sm text-slate-500">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title="All events" icon={<Calendar className="h-4 w-4" />} />
          <CardBody>
            {events.length === 0 ? (
              <Empty
                icon={<Calendar className="h-10 w-10" />}
                title="No events yet"
                description="Create your first event on the right."
              />
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Title</th>
                    <th className="py-2">When</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Visibility</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="New event" />
          <CardBody>
            <EventForm types={types} mode="create" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}