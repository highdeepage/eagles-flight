import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Audit Log — Eagles Flight" };

interface AuditRow {
  id: number;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  created_at: string;
}

export default async function AuditPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("audit_log")
    .select("id,actor_email,action,entity,entity_id,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as AuditRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every significant action. Last 200 entries.
        </p>
      </div>

      <Card>
        <CardHeader title="Recent activity" description={`${rows.length} entries`} />
        <CardBody>
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">No audit entries yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">When</th>
                  <th className="py-2">Actor</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Entity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 text-xs text-slate-500">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 text-xs">{e.actor_email ?? "—"}</td>
                    <td className="py-2 font-mono text-xs">{e.action}</td>
                    <td className="py-2 text-xs">
                      {e.entity}
                      {e.entity_id ? ` · ${e.entity_id.slice(0, 8)}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}