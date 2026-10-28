"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadPhotoToAlbum } from "@/lib/gallery/actions";
import { Button, Input, Label, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function PhotoUploader({ albumId }: { albumId: string }) {
  const router = useRouter();
  const { push } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(uploadPhotoToAlbum, null);

  useEffect(() => {
    if (state?.ok) {
      push("success", "Photos uploaded.");
      formRef.current?.reset();
      router.refresh();
    }
    if (state && !state.ok) push("error", state.error.message);
  }, [state, push, router]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="album_id" value={albumId} />

      {state && !state.ok && <Alert variant="error">{state.error.message}</Alert>}

      <div>
        <Label>Photos (multiple allowed)</Label>
        <input
          type="file"
          name="photos"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm hover:file:bg-slate-50"
        />
        <p className="mt-1 text-xs text-slate-500">
          Auto-resized to 1600px + thumbnails. Under 10 MB each.
        </p>
      </div>
      <div>
        <Label>Caption (applied to all)</Label>
        <Input name="caption" placeholder="Optional" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_featured" />
        Feature on homepage
      </label>
      <Button type="submit" loading={pending} className="w-full">
        Upload
      </Button>
    </form>
  );
}