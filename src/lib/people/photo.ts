import "server-only";
import sharp from "sharp";
import { createAdminSupabase } from "@/lib/db/admin";
import { AppError, Errors } from "@/lib/errors/AppError";

const MAX_BYTES = 3_000_000; // 3MB input limit

/** Detects real image type from magic bytes. Returns mime or null. */
export function sniffImage(buf: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return "image/webp";
  return null;
}

export interface PassportSettings {
  width: number;
  height: number;
  maxKb: number;
}

/**
 * Processes an uploaded passport photo:
 *  - validates magic bytes
 *  - auto-rotates by EXIF
 *  - resizes to settings.width × settings.height (contain, no distortion)
 *  - compresses to JPEG under settings.maxKb
 *  - uploads to storage under 'passports/<bucket>/<uuid>.jpg'
 *  - returns the storage path
 */
export async function processAndStorePassport(
  file: File,
  kind: "students" | "staff" | "parents",
  passport: PassportSettings,
): Promise<string> {
  if (file.size === 0) throw Errors.validation("No file provided.");
  if (file.size > MAX_BYTES) throw Errors.validation("Photo must be under 3 MB.");

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = sniffImage(buf);
  if (!mime) throw Errors.validation("That file is not a valid image (JPG/PNG/WebP).");

  let img = sharp(buf, { failOn: "error" }).rotate();
  const meta = await img.metadata();
  if (!meta.width || !meta.height) throw Errors.validation("Could not read image dimensions.");

  // Resize to fit the target box without distortion
  const target = { width: passport.width, height: passport.height };
  const resized = await img
    .resize({
      width: target.width,
      height: target.height,
      fit: "inside",
      withoutEnlargement: false,
    })
    .jpeg({ quality: 82, progressive: true })
    .toBuffer();

  // If still too large, reduce quality
  let finalBuf = resized;
  let quality = 82;
  while (finalBuf.length > passport.maxKb * 1024 && quality > 50) {
    quality -= 8;
    finalBuf = await sharp(buf)
      .rotate()
      .resize({ width: target.width, height: target.height, fit: "inside" })
      .jpeg({ quality, progressive: true })
      .toBuffer();
  }
  if (finalBuf.length > passport.maxKb * 1024) {
    throw Errors.validation(`Photo could not be compressed under ${passport.maxKb} KB.`);
  }

  const path = `${kind}/${crypto.randomUUID()}.jpg`;
  const admin = createAdminSupabase();
  const { error } = await admin.storage.from("passports").upload(path, finalBuf, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) throw Errors.internal("Photo upload failed.");

  return path;
}