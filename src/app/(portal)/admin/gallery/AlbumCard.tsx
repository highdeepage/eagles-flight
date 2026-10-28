"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAlbum } from "@/lib/gallery/actions";
import { Button, useToast } from "@/components/ui";
import type { GalleryAlbum } from "@/lib/gallery/queries";

export function AlbumCard({ album }: { album: GalleryAlbum }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();

  const remove = () => {
    if (!confirm(`Delete album "${album.title}" and all its photos?`)) return;
    start(async () => {
      try {
        await deleteAlbum(album.id);
        push("success", "Album deleted.");
        router.refresh();
      } catch {
        push("error", "Failed to delete.");
      }
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium text-slate-900">{album.title}</div>
          <div className="text-xs text-slate-500">
            {album.category ?? "—"} ·{" "}
            {album.event_date
              ? new Date(album.event_date).toLocaleDateString()
              : "No date"}
          </div>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-xs ${
            album.is_public
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {album.is_public ? "Public" : "Hidden"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        <Link href={`/admin/gallery/${album.id}`}>
          <Button size="sm" variant="secondary">Manage photos</Button>
        </Link>
        <Button size="sm" variant="danger" onClick={remove} disabled={pending}>
          Delete
        </Button>
      </div>
    </div>
  );
}