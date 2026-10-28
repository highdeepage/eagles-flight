"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

const enrolSchema = z.object({
  student_id: z.string().uuid(),
  class_arm_id: z.string().uuid(),
  term_id: z.string().uuid(),
  session_id: z.string().uuid(),
});

export async function enrolStudent(
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = enrolSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation(
        "Check the form.",
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path[0] as string, i.message]),
        ),
      );
    }

    const s = await createServerSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (s.from("enrolments") as any).upsert(
      {
        student_id: parsed.data.student_id,
        class_arm_id: parsed.data.class_arm_id,
        term_id: parsed.data.term_id,
        session_id: parsed.data.session_id,
        status: "enrolled",
      },
      { onConflict: "student_id,term_id" },
    );

    if (error) throw Errors.internal("Could not enrol student.");

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "enrolment.create",
      entity: "enrolments",
      after: parsed.data,
    });

    revalidatePath("/admin/enrolments");
    return null;
  });
}

export async function removeEnrolment(id: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  const { error } = await s.from("enrolments").delete().eq("id", id);
  if (error) throw Errors.internal("Could not remove enrolment.");
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "enrolment.delete",
    entity: "enrolments",
    entityId: id,
  });
  revalidatePath("/admin/enrolments");
}