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

// ─── Create album ──────────────────────────────────────────
const albumSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  category: z.string().optional(),
  event_date: z.string().optional(),
  is_public: z.coerce.boolean().default(true),
});

export async function createAlbum(
  _: ActionResult<{ id: string; slug: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string; slug: string }>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = albumSchema.safeParse({
      ...Object.fromEntries(formData),
      is_public: formData.get("is_public") === "on",
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
    const { data, error } = await (s.from("gallery_albums") as any)
      .insert({
        slug,
        title: d.title,
        description: d.description || null,
        category: d.category || null,
        event_date: d.event_date || null,
        is_public: d.is_public,
      })
      .select("id,slug")
      .single();

    if (error) {
      if (error.code === "23505")
        throw Errors.conflict("An album with that title already exists.");
      throw Errors.internal("Could not create album.");
    }

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "gallery.album.create",
      entity: "gallery_albums",
      entityId: data.id,
      after: d,
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return data as { id: string; slug: string };
  });
}

export async function updateAlbum(
  id: string,
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = albumSchema.safeParse({
      ...Object.fromEntries(formData),
      is_public: formData.get("is_public") === "on",
    });
    if (!parsed.success) throw Errors.validation("Check the form.");
    const d = parsed.data;

    const s = await createServerSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (s.from("gallery_albums") as any)
      .update({
        title: d.title,
        description: d.description || null,
        category: d.category || null,
        event_date: d.event_date || null,
        is_public: d.is_public,
      })
      .eq("id", id);

    if (error) throw Errors.internal("Could not update album.");

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "gallery.album.update",
      entity: "gallery_albums",
      entityId: id,
      after: d,
    });

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${id}`);
    revalidatePath("/gallery");
    return null;
  });
}

export async function deleteAlbum(id: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  const { error } = await s.from("gallery_albums").delete().eq("id", id);
  if (error) throw Errors.internal("Could not delete album.");
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "gallery.album.delete",
    entity: "gallery_albums",
    entityId: id,
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

// ─── Photo upload ─────────────────────────────────────────
export async function uploadPhotoToAlbum(
  _: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const albumId = formData.get("album_id") as string | null;
    const caption = (formData.get("caption") as string | null) || null;
    const isFeatured = formData.get("is_featured") === "on";
    const files = formData.getAll("photos") as File[];

    if (!albumId) throw Errors.validation("Missing album.");
    if (!files || files.length === 0 || files.every((f) => f.size === 0))
      throw Errors.validation("Please choose at least one photo.");

    const sharp = (await import("sharp")).default;
    const s = await createServerSupabase();

    let lastId = "";
    let uploaded = 0;

    for (const file of files) {
      if (file.size === 0) continue;
      if (file.size > 10_000_000) {
        throw Errors.validation(`Photo "${file.name}" is over 10 MB.`);
      }

      const buf = Buffer.from(await file.arrayBuffer());

      // Resize + compress main image (max 1600px)
      const main = await sharp(buf, { failOn: "error" })
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, progressive: true })
        .toBuffer();

      // Thumbnail (square 400×400 crop)
      const thumb = await sharp(buf, { failOn: "error" })
        .rotate()
        .resize({ width: 400, height: 400, fit: "cover" })
        .jpeg({ quality: 78, progressive: true })
        .toBuffer();

      const id = crypto.randomUUID();
      const mainPath = `${albumId}/${id}.jpg`;
      const thumbPath = `${albumId}/${id}-thumb.jpg`;

      const { error: upErr1 } = await s.storage
        .from("gallery")
        .upload(mainPath, main, { contentType: "image/jpeg", upsert: false });
      if (upErr1) throw Errors.internal(`Upload failed for ${file.name}.`);

      await s.storage
        .from("gallery")
        .upload(thumbPath, thumb, { contentType: "image/jpeg", upsert: false });

      const { data: pub } = s.storage.from("gallery").getPublicUrl(mainPath);
      const { data: pubThumb } = s.storage.from("gallery").getPublicUrl(thumbPath);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: row, error: insErr } = await (s.from("gallery_photos") as any)
        .insert({
          album_id: albumId,
          image_url: pub.publicUrl,
          thumbnail_url: pubThumb.publicUrl,
          caption,
          is_featured: isFeatured,
        })
        .select("id")
        .single();

      if (insErr) throw Errors.internal("Could not save photo record.");

      lastId = row.id;
      uploaded += 1;
    }

    if (uploaded === 0) throw Errors.validation("No valid photos were uploaded.");

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "gallery.photos.upload",
      entity: "gallery_photos",
      after: { album_id: albumId, count: uploaded },
    });

    revalidatePath(`/admin/gallery/${albumId}`);
    revalidatePath("/gallery");
    revalidatePath("/");
    return { id: lastId };
  });
}

export async function updatePhoto(
  id: string,
  caption: string,
  isFeatured: boolean,
): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (s.from("gallery_photos") as any)
    .update({ caption: caption || null, is_featured: isFeatured })
    .eq("id", id);
  if (error) throw Errors.internal("Could not update photo.");
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "gallery.photo.update",
    entity: "gallery_photos",
    entityId: id,
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function deletePhoto(id: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  const { data: photo } = await s
    .from("gallery_photos")
    .select("album_id,image_url,thumbnail_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await s.from("gallery_photos").delete().eq("id", id);
  if (error) throw Errors.internal("Could not delete photo.");

  // Best-effort storage cleanup
  const anyPhoto = photo as any;
  if (anyPhoto?.image_url) {
    const mainPath = decodeURIComponent(
      anyPhoto.image_url.split("/gallery/")[1]?.split("?")[0] ?? "",
    );
    if (mainPath) await s.storage.from("gallery").remove([mainPath]);
  }
  if (anyPhoto?.thumbnail_url) {
    const thumbPath = decodeURIComponent(
      anyPhoto.thumbnail_url.split("/gallery/")[1]?.split("?")[0] ?? "",
    );
    if (thumbPath) await s.storage.from("gallery").remove([thumbPath]);
  }

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "gallery.photo.delete",
    entity: "gallery_photos",
    entityId: id,
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
}