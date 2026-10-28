"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePhoto } from "@/lib/gallery/actions";
import { useToast } from "@/components/ui";
import { Trash2 } from "lucide-react";
import type { GalleryPhoto } from "@/lib/gallery/queries";

export function PhotoGrid({ photos }: { photos: GalleryPhoto[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();

  if (photos.length === 0) {
    return <p className="text-sm text-slate-500">No photos yet. Upload some.</p>;
  }

  const remove = (id: string) => {
    if (!confirm("Delete this photo?")) return;
    start(async () => {
      try {
        await deletePhoto(id);
        push("success", "Deleted.");
        router.refresh();
      } catch {
        push("error", "Failed.");
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative overflow-hidden rounded-lg border border-slate-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.thumbnail_url ?? photo.image_url}
            alt={photo.caption ?? ""}
            className="aspect-square w-full object-cover"
          />
          {photo.caption && (
            <div className="absolute inset-x-0 bottom-8 bg-black/60 p-1 text-xs text-white line-clamp-1">
              {photo.caption}
            </div>
          )}
          {photo.is_featured && (
            <div className="absolute left-1 top-1 rounded bg-amber-400 px-1 text-xs font-bold text-amber-900">
              ★
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-end bg-black/40 p-1">
            <button
              type="button"
              disabled={pending}
              onClick={() => remove(photo.id)}
              className="rounded p-1 text-white hover:bg-red-600"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}