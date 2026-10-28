import "server-only";
import { createServerSupabase } from "@/lib/db/server";

/** Returns the set of permission keys granted to a role. */
export async function getRolePermissions(roleKey: string): Promise<Set<string>> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permissions(key), roles!inner(key)")
    .eq("roles.key", roleKey);

  if (error || !data) return new Set();
  const out = new Set<string>();
  for (const row of data as any[]) {
    const k = row?.permissions?.key;
    if (k) out.add(k);
  }
  return out;
}

/** Central permission check. Server-side only. */
export async function userHasPermission(
  roleKey: string,
  permissionKey: string,
): Promise<boolean> {
  const perms = await getRolePermissions(roleKey);
  return perms.has(permissionKey);
}

/**
 * Permission key registry — used by UI to gate menus and buttons.
 * These keys MUST match the seed in supabase/seed/0001_defaults.sql.
 * The list itself is static because it's a code contract, not business data.
 */
export const PERMISSIONS = {
  SETTINGS_MANAGE: "settings.manage",
  USERS_MANAGE: "users.manage",
  STUDENTS_VIEW: "students.view",
  STUDENTS_CREATE: "students.create",
  STUDENTS_EDIT: "students.edit",
  STUDENTS_DELETE: "students.delete",
  STAFF_VIEW: "staff.view",
  STAFF_MANAGE: "staff.manage",
  PARENTS_MANAGE: "parents.manage",
  ACADEMICS_MANAGE: "academics.manage",
  ASSIGNMENTS_MANAGE: "assignments.manage",
  ATTENDANCE_VIEW: "attendance.view",
  ATTENDANCE_RECORD: "attendance.record",
  RESULTS_ENTER: "results.enter",
  RESULTS_SUBMIT: "results.submit",
  RESULTS_APPROVE: "results.approve",
  RESULTS_PUBLISH: "results.publish",
  RESULTS_VIEW: "results.view",
  REPORT_CARD_GENERATE: "reportcard.generate",
  CBT_AUTHOR: "cbt.author",
  CBT_TAKE: "cbt.take",
  FEES_VIEW: "fees.view",
  FEES_RECORD: "fees.record",
  ADMISSIONS_REVIEW: "admissions.review",
  LIBRARY_MANAGE: "library.manage",
  INVENTORY_MANAGE: "inventory.manage",
  TRANSPORT_MANAGE: "transport.manage",
  CONTENT_MANAGE: "content.manage",
  AUDIT_VIEW: "audit.view",
  SYSTEM_CONFIGURE: "system.configure",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];