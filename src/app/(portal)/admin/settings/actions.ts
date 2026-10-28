"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  school_name: z.string().min(1),
  short_name: z.string().optional(),
  motto: z.string().optional(),
  address: z.string().optional(),
  phone_primary: z.string().optional(),
  phone_secondary: z.string().optional(),
  email_primary: z.string().email().optional().or(z.literal("")),
  email_admissions: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  history: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  principal_name: z.string().optional(),
  principal_message: z.string().optional(),
  footer_text: z.string().optional(),
  brand_primary: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex colour"),
  brand_accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex colour"),
  passport_width: z.coerce.number().int().min(100).max(2000),
  passport_height: z.coerce.number().int().min(100).max(2000),
  passport_max_kb: z.coerce.number().int().min(20).max(5000),
});

export async function updateSettings(
  _prev: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();

    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation(
        "Please correct the highlighted fields.",
        Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])),
      );
    }
    const d = parsed.data;

    const supabase = await createServerSupabase();
    const { data: before } = await supabase.from("school_settings").select("*").eq("id", 1).single();

    const { error } = await supabase
      .from("school_settings")
      .update({
        school_name: d.school_name,
        short_name: d.short_name || null,
        motto: d.motto || null,
        address: d.address || null,
        phone_primary: d.phone_primary || null,
        phone_secondary: d.phone_secondary || null,
        email_primary: d.email_primary || null,
        email_admissions: d.email_admissions || null,
        website: d.website || null,
        history: d.history || null,
        vision: d.vision || null,
        mission: d.mission || null,
        principal_name: d.principal_name || null,
        principal_message: d.principal_message || null,
        footer_text: d.footer_text || null,
        brand_colors: { primary: d.brand_primary, accent: d.brand_accent, surface: "#ffffff" },
        passport_photo: { width: d.passport_width, height: d.passport_height, max_kb: d.passport_max_kb },
      })
      .eq("id", 1);

    if (error) throw Errors.internal("Could not save settings. Please try again.");

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "settings.update",
      entity: "school_settings",
      entityId: "1",
      before,
      after: d,
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return null;
  });
}