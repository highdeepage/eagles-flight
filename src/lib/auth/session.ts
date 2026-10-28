import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/db/server";
import { Errors } from "@/lib/errors/AppError";

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  is_active: boolean;
  must_change_pw: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id,email,role,full_name,is_active,must_change_pw")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) return null;
  return profile as SessionUser;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw Errors.forbidden();
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole("admin", "principal");
}