import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Users — Eagles Flight" };

export default async function UsersPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("users")
    .select("id,email,role,full_name,is_active,created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-500">Manage accounts and roles. User creation with email invites lands in Phase 4.</p>
      </div>

      <Card>
        <CardHeader title="All users" description={`${data?.length ?? 0} accounts`} />
        <CardBody>
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Email</th>
                <th className="py-2">Name</th>
                <th className="py-2">Role</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 font-mono text-xs">{u.email}</td>
                  <td className="py-2">{u.full_name ?? "—"}</td>
                  <td className="py-2 capitalize">{u.role.replace("_", " ")}</td>
                  <td className="py-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${u.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}