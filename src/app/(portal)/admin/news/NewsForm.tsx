"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createNews, updateNews } from "@/lib/content/actions";
import {
  Button,
  Input,
  Label,
  Select,
  Alert,
  Card,
  CardBody,
  CardHeader,
  useToast,
} from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";
import type { NewsPost, ListItem } from "@/lib/content/queries";

interface Props {
  categories: ListItem[];
  initial?: NewsPost;
  mode: "create" | "edit";
}

export function NewsForm({ categories, initial, mode }: Props) {
  const router = useRouter();
  const { push } = useToast();

  const action =
    mode === "create"
      ? createNews
      : updateNews.bind(null, initial?.id ?? "");

  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string; slug: string }> | ActionResult<null> | null,
    FormData
  >(action as any, null);

  useEffect(() => {
    if (state?.ok) {
      push("success", mode === "create" ? "Post created." : "Post updated.");
      router.push("/admin/news");
    }
    if (state && !state.ok && !state.error.fieldErrors)
      push("error", state.error.message);
  }, [state, push, router, mode]);

  const err = (k: string) =>
    state && !state.ok ? state.error.fieldErrors?.[k] : undefined;
  const p = initial ?? ({} as Partial<NewsPost>);

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">
          {mode === "create" ? "New post" : "Edit post"}
        </h1>
        <Button type="submit" loading={pending}>
          Save
        </Button>
      </div>

      {state && !state.ok && !state.error.fieldErrors && (
        <Alert variant="error">{state.error.message}</Alert>
      )}

      <Card>
        <CardHeader title="Post details" />
        <CardBody className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              name="title"
              defaultValue={p.title ?? ""}
              required
              error={err("title")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select name="category" defaultValue={p.category ?? ""}>
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.item_key} value={c.item_key}>
                    {c.item_label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Cover image URL (optional)</Label>
              <Input
                name="cover_image_url"
                type="url"
                placeholder="https://..."
                defaultValue={p.cover_image_url ?? ""}
                error={err("cover_image_url")}
              />
            </div>
          </div>
          <div>
            <Label>Excerpt (short summary)</Label>
            <textarea
              name="excerpt"
              rows={2}
              defaultValue={p.excerpt ?? ""}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="One-line summary shown on the list page"
            />
          </div>
          <div>
            <Label>Body</Label>
            <textarea
              name="body"
              rows={12}
              defaultValue={p.body ?? ""}
              required
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
              placeholder="Write the full post content here…"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={p.is_published ?? false}
              />
              Publish immediately (visible on public site)
            </label>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}