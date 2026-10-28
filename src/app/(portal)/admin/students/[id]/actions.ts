"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { createAdminSupabase } from "@/lib/db/admin";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  student_id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8, "Minimum 8 characters."),
});

export async function createStudentLogin(
  _: ActionResult<{ userId: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ userId: string }>> {
  return safeAction(async () => {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation(
        "Check the form.",
        Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])),
      );
    }
    const d = parsed.data;

    const supabase = await createServerSupabase();
    const { data: student } = await supabase
      .from("students")
      .select("surname,first_name,user_id")
      .eq("id", d.student_id)
      .single();
    if (!student) throw Errors.notFound("Student not found.");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((student as any).user_id) {
      throw Errors.conflict("This student already has a login.");
    }

    const adminClient = createAdminSupabase();
    const { data: created, error: authErr } = await adminClient.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
      user_metadata: {
        role: "student",
        full_name: `${student.first_name} ${student.surname}`,
      },
    });
    if (authErr || !created.user) {
      throw Errors.internal(authErr?.message ?? "Could not create login.");
    }

    const { error: linkErr } = await supabase
      .from("students")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ user_id: created.user.id, email: d.email } as any)
      .eq("id", d.student_id);

    if (linkErr) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      throw Errors.internal("Could not link student record.");
    }

    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "student.login_create",
      entity: "users",
      entityId: created.user.id,
      after: { student_id: d.student_id, email: d.email },
    });

    revalidatePath(`/admin/students/${d.student_id}`);
    return { userId: created.user.id };
  });
}

export async function deactivateStudentLogin(studentId: string): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const admin = await requireAdmin();
    const supabase = await createServerSupabase();

    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("id", studentId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (student as any)?.user_id;
    if (!userId) throw Errors.notFound("No login to deactivate.");

    const { error } = await supabase
      .from("users")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ is_active: false } as any)
      .eq("id", userId);
    if (error) throw Errors.internal("Could not deactivate.");

    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "student.login_deactivate",
      entity: "users",
      entityId: userId,
    });

    revalidatePath(`/admin/students/${studentId}`);
    return null;
  });
}