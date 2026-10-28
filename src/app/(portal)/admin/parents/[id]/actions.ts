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
  parent_id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8, "Minimum 8 characters."),
});

export async function createParentLogin(
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
    const { data: parent } = await supabase
      .from("parents")
      .select("surname,first_name,user_id")
      .eq("id", d.parent_id)
      .single();
    if (!parent) throw Errors.notFound("Parent not found.");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((parent as any).user_id) {
      throw Errors.conflict("This parent already has a login.");
    }

    const adminClient = createAdminSupabase();
    const { data: created, error: authErr } = await adminClient.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
      user_metadata: {
        role: "parent",
        full_name: `${parent.first_name} ${parent.surname}`,
      },
    });
    if (authErr || !created.user) {
      throw Errors.internal(authErr?.message ?? "Could not create login.");
    }

    const { error: linkErr } = await supabase
      .from("parents")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ user_id: created.user.id, email: d.email } as any)
      .eq("id", d.parent_id);

    if (linkErr) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      throw Errors.internal("Could not link parent record.");
    }

    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "parent.login_create",
      entity: "users",
      entityId: created.user.id,
      after: { parent_id: d.parent_id, email: d.email },
    });

    revalidatePath(`/admin/parents/${d.parent_id}`);
    return { userId: created.user.id };
  });
}

export async function deactivateParentLogin(parentId: string): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const admin = await requireAdmin();
    const supabase = await createServerSupabase();

    const { data: parent } = await supabase
      .from("parents")
      .select("user_id")
      .eq("id", parentId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (parent as any)?.user_id;
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
      action: "parent.login_deactivate",
      entity: "users",
      entityId: userId,
    });

    revalidatePath(`/admin/parents/${parentId}`);
    return null;
  });
}