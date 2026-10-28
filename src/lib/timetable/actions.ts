"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

const periodSchema = z.object({
  label: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  sort_order: z.coerce.number().int().default(0),
  is_break: z.coerce.boolean().default(false),
});

export async function createPeriod(_: ActionResult<null> | null, formData: FormData): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = periodSchema.safeParse({
      ...Object.fromEntries(formData),
      is_break: formData.get("is_break") === "on",
    });
    if (!parsed.success) throw Errors.validation("Check the form.");
    const s = await createServerSupabase();
    const { error } = await s.from("periods").insert(parsed.data);
    if (error) throw Errors.internal("Could not create period.");
    await logAudit({ actorId: user.id, actorEmail: user.email, action: "period.create", entity: "periods", after: parsed.data });
    revalidatePath("/admin/timetable");
    return null;
  });
}

const entrySchema = z.object({
  class_arm_id: z.string().uuid(),
  term_id: z.string().uuid(),
  period_id: z.string().uuid(),
  day_of_week: z.coerce.number().int().min(1).max(5),
  subject_id: z.string().uuid().optional().or(z.literal("")),
  staff_id: z.string().uuid().optional().or(z.literal("")),
  room: z.string().optional(),
});

export async function saveTimetableEntry(_: ActionResult<null> | null, formData: FormData): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = entrySchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation("Check the form.",
        Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])));
    }
    const d = parsed.data;
    const s = await createServerSupabase();
    const payload = {
      class_arm_id: d.class_arm_id,
      term_id: d.term_id,
      period_id: d.period_id,
      day_of_week: d.day_of_week,
      subject_id: d.subject_id || null,
      staff_id: d.staff_id || null,
      room: d.room || null,
    };
    const { error } = await s.from("timetable_entries").upsert(payload, {
      onConflict: "class_arm_id,term_id,period_id,day_of_week",
    });
    if (error) throw Errors.internal("Could not save timetable entry.");
    await logAudit({ actorId: user.id, actorEmail: user.email, action: "timetable.save", entity: "timetable_entries", after: payload });
    revalidatePath("/admin/timetable");
    return null;
  });
}