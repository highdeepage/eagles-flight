"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/lib/events/actions";
import { Button, useToast } from "@/components/ui";
import type { EventRow as EventRowType } from "@/lib/events/queries";

export function EventRow({ event }: { event: EventRowType }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();

  const remove = () => {
    if (!confirm(`Delete "${event.title}"?`)) return;
    start(async () => {
      try {
        await deleteEvent(event.id);
        push("success", "Deleted.");
        router.refresh();
      } catch {
        push("error", "Failed to delete.");
      }
    });
  };

  const isPast = new Date(event.start_at) < new Date();

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2">
        <div className="font-medium">{event.title}</div>
        {event.location && (
          <div className="text-xs text-slate-500">{event.location}</div>
        )}
      </td>
      <td className="py-2 text-xs">
        {new Date(event.start_at).toLocaleDateString()}
        <div className="text-slate-500">
          {new Date(event.start_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isPast && <span className="ml-2 text-slate-400">(past)</span>}
        </div>
      </td>
      <td className="py-2 text-slate-600">{event.event_type ?? "—"}</td>
      <td className="py-2">
        <span
          className={`rounded px-2 py-0.5 text-xs ${
            event.is_public
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {event.is_public ? "Public" : "Private"}
        </span>
      </td>
      <td className="py-2 text-right">
        <div className="flex justify-end gap-1">
          <Link href={`/admin/events/${event.id}`}>
            <Button size="sm" variant="secondary">Edit</Button>
          </Link>
          <Button size="sm" variant="danger" onClick={remove} disabled={pending}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}