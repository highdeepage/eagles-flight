"use client";

import { useActionState, useEffect } from "react";
import { updateAlbum } from "@/lib/gallery/actions";
import {
  Button,
  Input,
  Label,
  Select,
  Alert,
  useToast,
} from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";
import type { GalleryAlbum, ListItem } from "@/lib/gallery/queries";

export function AlbumEditForm({
  album,
  categories,
}: {
  album: GalleryAlbum;
  categories: ListItem[];
}) {
  const { push } = useToast();
  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(
    updateAlbum.bind(null, album.id),
    null,
  );

  useEffect(() => {
    if (state?.ok) push("success", "Album updated.");
    if (state && !state.ok && !state.error.fieldErrors)
      push("error", state.error.message);
  }, [state, push]);

  return (
    <form action={action} className="space-y-3">
      {state && !state.ok && !state.error.fieldErrors && (
        <Alert variant="error">{state.error.message}</Alert>
      )}

      <div>
        <Label>Title</Label>
        <Input name="title" defaultValue={album.title} required />
      </div>
      <div>
        <Label>Description</Label>
        <textarea
          name="description"
          rows={2}
          defaultValue={album.description ?? ""}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Category</Label>
          <Select name="category" defaultValue={album.category ?? ""}>
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
          <Input name="event_date" type="date" defaultValue={album.event_date ?? ""} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_public"
          defaultChecked={album.is_public}
        />
        Public
      </label>
      <Button type="submit" loading={pending} className="w-full">
        Save changes
      </Button>
    </form>
  );
}