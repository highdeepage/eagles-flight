"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/events/actions";
import {
  Button,
  Input,
  Label,
  Select,
  Alert,
  useToast,
} from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";
import type { EventRow, ListItem } from "@/lib/events/queries";

interface Props {
  types: ListItem[];
  initial?: EventRow;
  mode: "create" | "edit";
}

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function EventForm({ types, initial, mode }: Props) {
  const router = useRouter();
  const { push } = useToast();

  const action =
    mode === "create"
      ? createEvent
      : updateEvent.bind(null, initial?.id ?? "");

  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | ActionResult<null> | null,
    FormData
  >(action as any, null);

  useEffect(() => {
    if (state?.ok) {
      push("success", mode === "create" ? "Event created." : "Event updated.");
      router.push("/admin/events");
    }
    if (state && !state.ok && !state.error.fieldErrors)
      push("error", state.error.message);
  }, [state, push, router, mode]);

  const err = (k: string) =>
    state && !state.ok ? state.error.fieldErrors?.[k] : undefined;
  const e = initial;

  return (
    <form action={formAction} className="space-y-3">
      {state && !state.ok && !state.error.fieldErrors && (
        <Alert variant="error">{state.error.message}</Alert>
      )}

      <div>
        <Label>Title</Label>
        <Input name="title" defaultValue={e?.title ?? ""} required error={err("title")} />
      </div>
      <div>
        <Label>Description</Label>
        <textarea
          name="description"
          rows={2}
          defaultValue={e?.description ?? ""}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Type</Label>
          <Select name="event_type" defaultValue={e?.event_type ?? ""}>
            <option value="">—</option>
            {types.map((t) => (
              <option key={t.item_key} value={t.item_key}>
                {t.item_label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Input name="location" defaultValue={e?.location ?? ""} />
        </div>
      </div>
      <div>
        <Label>Start</Label>
        <Input
          name="start_at"
          type="datetime-local"
          defaultValue={toLocalInput(e?.start_at)}
          required
          error={err("start_at")}
        />
      </div>
      <div>
        <Label>End (optional)</Label>
        <Input
          name="end_at"
          type="datetime-local"
          defaultValue={toLocalInput(e?.end_at)}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_all_day"
          defaultChecked={e?.is_all_day ?? false}
        />
        All-day event
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_public"
          defaultChecked={e?.is_public ?? true}
        />
        Public (visible on public site)
      </label>
      <Button type="submit" loading={pending} className="w-full">
        {mode === "create" ? "Create event" : "Save changes"}
      </Button>
    </form>
  );
}