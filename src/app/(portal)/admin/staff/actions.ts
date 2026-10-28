"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { createAdminSupabase } from "@/lib/db/admin";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

// ─── Teacher login creation ─────────────────────────────────
const createLoginSchema = z.object({
  staff_id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["teacher", "class_teacher"]),
  password: z.string().min(8, "Minimum 8 characters."),
  full_name: z.string().min(1),
});

export async function createTeacherLogin(
  _: ActionResult<{ userId: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ userId: string }>> {
  return safeAction(async () => {
    const admin = await requireAdmin();

    const parsed = createLoginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation(
        "Check the form.",
        Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])),
      );
    }
    const d = parsed.data;

    // 1. Create auth user via service role
    const supabaseAdmin = createAdminSupabase();
    const { data: created, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
      user_metadata: { role: d.role, full_name: d.full_name },
    });

    if (authErr || !created.user) {
      throw Errors.internal(authErr?.message ?? "Could not create login.");
    }

    // 2. Link staff record to the new user
    const supabase = await createServerSupabase();
    const { error: linkErr } = await supabase
      .from("staff")
      .update({ user_id: created.user.id, email: d.email })
      .eq("id", d.staff_id);

    if (linkErr) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw Errors.internal("Could not link staff record.");
    }

    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "teacher.login_create",
      entity: "users",
      entityId: created.user.id,
      after: { staff_id: d.staff_id, email: d.email, role: d.role },
    });

    revalidatePath(`/admin/staff/${d.staff_id}`);
    revalidatePath("/admin/staff");
    return { userId: created.user.id };
  });
}

export async function deactivateStaffLogin(staffId: string): Promise<void> {
  const admin = await requireAdmin();
  const supabase = await createServerSupabase();

  const { data: staff } = await supabase
    .from("staff")
    .select("user_id")
    .eq("id", staffId)
    .single();

  if (staff?.user_id) {
    await supabase.from("users").update({ is_active: false }).eq("id", staff.user_id);
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "teacher.login_deactivate",
      entity: "users",
      entityId: staff.user_id,
    });
    revalidatePath(`/admin/staff/${staffId}`);
  }
}