"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabase } from "@/lib/db/admin";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

const MAX_BYTES = 1_500_000; // 1.5 MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

/** Detects real image type from magic bytes, ignores claimed MIME. */
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  // WebP
  if (buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return "image/webp";
  // SVG (text)
  const head = buf.slice(0, 200).toString("utf8").trimStart();
  if (head.startsWith("<?xml") || head.startsWith("<svg")) return "image/svg+xml";
  return null;
}

export async function uploadLogo(
  _: ActionResult<{ url: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const file = formData.get("logo") as File | null;
    if (!file || file.size === 0) throw Errors.validation("Please choose a logo file.");
    if (file.size > MAX_BYTES) throw Errors.validation("Logo must be under 1.5 MB.");

    const buf = Buffer.from(await file.arrayBuffer());
    const mime = sniff(buf);
    if (!mime || !ALLOWED.includes(mime)) {
      throw Errors.validation("Unsupported file type. Use PNG, JPEG, WebP or SVG.");
    }

    const ext = mime.split("/")[1].replace("svg+xml", "svg");
    const path = `school/logo-${Date.now()}.${ext}`;

    const admin = createAdminSupabase();
    const { error: upErr } = await admin.storage
      .from("public-assets")
      .upload(path, buf, { contentType: mime, upsert: true });
    if (upErr) throw Errors.internal("Upload failed. Try again.");

    const { data: pub } = admin.storage.from("public-assets").getPublicUrl(path);
    const url = pub.publicUrl;

    // Persist to settings
    const { data: before } = await admin.from("school_settings").select("logo_url").eq("id", 1).single();
    await admin.from("school_settings").update({ logo_url: url }).eq("id", 1);

    await logAudit({
      actorId: user.id, actorEmail: user.email,
      action: "settings.logo_upload", entity: "school_settings", entityId: "1",
      before, after: { logo_url: url },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { url };
  });
}