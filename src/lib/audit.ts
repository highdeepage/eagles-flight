import "server-only";
import { createAdminSupabase } from "@/lib/db/admin";

export interface AuditEntry {
  actorId: string;
  actorEmail: string;
  action: string;       // e.g. 'settings.update'
  entity: string;       // e.g. 'school_settings'
  entityId?: string;
  before?: unknown;
  after?: unknown;
}

/** Writes to audit_log via service role (bypasses RLS for insert). */
export async function logAudit(entry: AuditEntry): Promise<void> {
  const admin = createAdminSupabase();
  await admin.from("audit_log").insert({
    actor_id: entry.actorId,
    actor_email: entry.actorEmail,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId ?? null,
    before: entry.before ? (entry.before as any) : null,
    after: entry.after ? (entry.after as any) : null,
  });
}