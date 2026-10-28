"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const newsSchema = z.object({
  title: z.string().min(1, "Title is required."),
  excerpt: z.string().optional(),
  body: z.string().min(1, "Body is required."),
  category: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  is_published: z.coerce.boolean().default(false),
});

export async function createNews(
  _: ActionResult<{ id: string; slug: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string; slug: string }>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = newsSchema.safeParse({
      ...Object.fromEntries(formData),
      is_published: formData.get("is_published") === "on",
    });
    if (!parsed.success) {
      throw Errors.validation(
        "Check the form.",
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path[0] as string, i.message]),
        ),
      );
    }
    const d = parsed.data;
    const slug = slugify(d.title);
    if (!slug) throw Errors.validation("Title must contain letters or numbers.");

    const s = await createServerSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (s.from("news_posts") as any)
      .insert({
        slug,
        title: d.title,
        excerpt: d.excerpt || null,
        body: d.body,
        category: d.category || null,
        cover_image_url: d.cover_image_url || null,
        author_id: user.id,
        is_published: d.is_published,
        published_at: d.is_published ? new Date().toISOString() : null,
      })
      .select("id,slug")
      .single();

    if (error) {
      if (error.code === "23505")
        throw Errors.conflict("A post with that title already exists.");
      throw Errors.internal("Could not create post.");
    }

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "news.create",
      entity: "news_posts",
      entityId: data.id,
      after: d,
    });

    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");
    return data as { id: string; slug: string };
  });
}

export async function updateNews(
  id: string,
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = newsSchema.safeParse({
      ...Object.fromEntries(formData),
      is_published: formData.get("is_published") === "on",
    });
    if (!parsed.success) throw Errors.validation("Check the form.");
    const d = parsed.data;

    const s = await createServerSupabase();
    const { data: existing } = await s
      .from("news_posts")
      .select("is_published,published_at")
      .eq("id", id)
      .single();

    const wasPublished = (existing as any)?.is_published === true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (s.from("news_posts") as any)
      .update({
        title: d.title,
        excerpt: d.excerpt || null,
        body: d.body,
        category: d.category || null,
        cover_image_url: d.cover_image_url || null,
        is_published: d.is_published,
        published_at:
          d.is_published && !wasPublished
            ? new Date().toISOString()
            : (existing as any)?.published_at ?? null,
      })
      .eq("id", id);

    if (error) throw Errors.internal("Could not update post.");

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "news.update",
      entity: "news_posts",
      entityId: id,
      after: d,
    });

    revalidatePath("/admin/news");
    revalidatePath(`/admin/news/${id}`);
    revalidatePath("/news");
    revalidatePath("/");
    return null;
  });
}

export async function deleteNews(id: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  const { error } = await s.from("news_posts").delete().eq("id", id);
  if (error) throw Errors.internal("Could not delete post.");
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "news.delete",
    entity: "news_posts",
    entityId: id,
  });
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");
}

export async function toggleNewsPublish(id: string, publish: boolean): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (s.from("news_posts") as any)
    .update({
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw Errors.internal("Could not update.");
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: publish ? "news.publish" : "news.unpublish",
    entity: "news_posts",
    entityId: id,
  });
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");
}