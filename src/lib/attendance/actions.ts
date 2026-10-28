"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireUser } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

const recordSchema = z.object({
  armId: z.string().uuid(),
  date: z.string(),
  records: z.array(
    z.object({
      student_id: z.string().uuid(),
      status: z.string().min(1),
      note: z.string().optional(),
    }),
  ),
});

export async function saveAttendance(payload: z.infer<typeof recordSchema>): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireUser();
    const parsed = recordSchema.safeParse(payload);
    if (!parsed.success) throw Errors.validation("Invalid attendance data.");

    const s = await createServerSupabase();
    const { data: term } = await s.from("terms").select("id").eq("is_current", true).maybeSingle();
    if (!term) throw Errors.validation("No current term. Ask an admin to set one.");

    const upserts = parsed.data.records.map((r) => ({
      student_id: r.student_id,
      class_arm_id: parsed.data.armId,
      term_id: term.id,
      date: parsed.data.date,
      status: r.status,
      note: r.note || null,
      recorded_by: user.id,
    }));

    const { error } = await s.from("attendance_records").upsert(upserts, {
      onConflict: "student_id,date",
    });

    if (error) throw Errors.internal("Could not save attendance.");

    await logAudit({
      actorId: user.id, actorEmail: user.email,
      action: "attendance.save", entity: "attendance_records",
      after: { armId: parsed.data.armId, date: parsed.data.date, count: upserts.length },
    });

    revalidatePath("/admin/attendance");
    revalidatePath("/teacher");
    return null;
  });
}