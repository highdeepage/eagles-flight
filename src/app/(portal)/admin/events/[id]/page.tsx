import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getEventById, listEventTypes } from "@/lib/events/queries";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { EventForm } from "../EventForm";

export const metadata = { title: "Edit Event — Admin" };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [event, types] = await Promise.all([getEventById(id), listEventTypes()]);
  if (!event) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/events" className="text-sm text-blue-700 hover:underline">
        ← Back to events
      </Link>
      <Card>
        <CardHeader title="Edit event" />
        <CardBody>
          <EventForm types={types} initial={event} mode="edit" />
        </CardBody>
      </Card>
    </div>
  );
}