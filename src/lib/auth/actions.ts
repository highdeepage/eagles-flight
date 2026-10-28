"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabase } from "@/lib/db/server";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function signIn(
  _prev: ActionResult<{ role: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ role: string }>> {
  return safeAction(async () => {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      throw Errors.validation("Please check the form and try again.",
        Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])),
      );
    }

    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error || !data.user) {
      throw Errors.validation("Invalid email or password.");
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role,is_active")
      .eq("id", data.user.id)
      .single();

    if (!profile || !profile.is_active) {
      await supabase.auth.signOut();
      throw Errors.forbidden("This account is inactive. Contact the administrator.");
    }

    await logAudit({
      actorId: data.user.id,
      actorEmail: data.user.email ?? parsed.data.email,
      action: "auth.login",
      entity: "users",
      entityId: data.user.id,
    });

    return { role: profile.role };
  });
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}

const pwSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Must contain an uppercase letter.")
    .regex(/[0-9]/, "Must contain a number."),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export async function changePassword(
  _prev: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const parsed = pwSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      throw Errors.validation(
        "Please correct the highlighted fields.",
        Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])),
      );
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw Errors.unauthorized();

    // Reauthenticate with current password
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });
    if (verifyErr) {
      throw Errors.validation("Current password is incorrect.", {
        currentPassword: "Current password is incorrect.",
      });
    }

    const { error: updateErr } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });
    if (updateErr) throw Errors.internal("Could not update password. Try again.");

    // Clear must_change_pw flag
    await supabase
      .from("users")
      .update({ must_change_pw: false })
      .eq("id", user.id);

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "auth.password_change",
      entity: "users",
      entityId: user.id,
    });

    return null;
  });
}