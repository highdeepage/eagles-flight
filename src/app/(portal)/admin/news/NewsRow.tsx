"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteNews, toggleNewsPublish } from "@/lib/content/actions";
import { useToast, Button } from "@/components/ui";
import type { NewsPost } from "@/lib/content/queries";

export function NewsRow({ post }: { post: NewsPost }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();

  const toggle = () =>
    start(async () => {
      try {
        await toggleNewsPublish(post.id, !post.is_published);
        push("success", post.is_published ? "Unpublished." : "Published.");
        router.refresh();
      } catch {
        push("error", "Failed to update.");
      }
    });

  const remove = () => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    start(async () => {
      try {
        await deleteNews(post.id);
        push("success", "Deleted.");
        router.refresh();
      } catch {
        push("error", "Failed to delete.");
      }
    });
  };

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2">
        <div className="font-medium">{post.title}</div>
        <div className="font-mono text-xs text-slate-500">{post.slug}</div>
      </td>
      <td className="py-2 text-slate-600">{post.category ?? "—"}</td>
      <td className="py-2">
        <span
          className={`rounded px-2 py-0.5 text-xs ${
            post.is_published
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {post.is_published ? "Published" : "Draft"}
        </span>
      </td>
      <td className="py-2 text-xs text-slate-500">
        {new Date(post.updated_at).toLocaleDateString()}
      </td>
      <td className="py-2 text-right">
        <div className="flex justify-end gap-1">
          <Link href={`/admin/news/${post.id}`}>
            <Button size="sm" variant="secondary">Edit</Button>
          </Link>
          <Button size="sm" variant="secondary" onClick={toggle} disabled={pending}>
            {post.is_published ? "Unpublish" : "Publish"}
          </Button>
          <Button size="sm" variant="danger" onClick={remove} disabled={pending}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}