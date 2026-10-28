"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAlbum } from "@/lib/gallery/actions";
import {
  Button,
  Input,
  Label,
  Select,
  Alert,
  useToast,
} from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";
import type { ListItem } from "@/lib/gallery/queries";

export function NewAlbumForm({ categories }: { categories: ListItem[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [state, action, pending] = useActionState<
    ActionResult<{ id: string; slug: string }> | null,
    FormData
  >(createAlbum, null);

  useEffect(() => {
    if (state?.ok) {
      push("success", "Album created.");
      router.push(`/admin/gallery/${state.data.id}`);
    }
    if (state && !state.ok && !state.error.fieldErrors)
      push("error", state.error.message);
  }, [state, push, router]);

  return (
    <form action={action} className="space-y-3">
      {state && !state.ok && !state.error.fieldErrors && (
        <Alert variant="error">{state.error.message}</Alert>
      )}

      <div>
        <Label>Title</Label>
        <Input name="title" required placeholder="e.g. Sports Day 2025" />
      </div>
      <div>
        <Label>Description</Label>
        <textarea
          name="description"
          rows={2}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Category</Label>
          <Select name="category">
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.item_key} value={c.item_key}>
                {c.item_label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Event date</Label>
          <Input name="event_date" type="date" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_public" defaultChecked />
        Public (visible on public site)
      </label>
      <Button type="submit" loading={pending} className="w-full">
        Create album
      </Button>
    </form>
  );
}