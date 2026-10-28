import Link from "next/link";
import { createServerSupabase } from "@/lib/db/server";
import { requireRole } from "@/lib/auth/session";
import { currentTerm } from "@/lib/results/queries";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Parent Portal — Eagles Flight" };

export default async function ParentDashboard() {
  const user = await requireRole("parent");
  const s = await createServerSupabase();
  const term = await currentTerm();

  const { data: parent } = await s
    .from("parents")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: links } = parent
    ? await s
        .from("parent_student")
        .select("relationship,is_primary,students(id,admission_no,surname,first_name,class_arms?no,year?,enrolments(id,class_arms(arm_name,classes(name)),term_id))")
        .eq("parent_id", parent.id)
    : { data: [] as any[] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user.full_name ?? user.email}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {term ? `${(term as any).academic_sessions?.name} — ${term.name}` : "No current term."}
        </p>
      </div>

      <Card>
        <CardHeader title="My children" description={`${(links ?? []).length} linked`} />
        <CardBody>
          {(links ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">No children linked yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(links ?? []).map((l: any, i: number) => (
                <li key={i} className="rounded border border-slate-200 p-3">
                  <div className="font-medium">{l.students?.surname}, {l.students?.first_name}</div>
                  <div className="text-xs text-slate-500">
                    {l.students?.admission_no} · {l.relationship}{l.is_primary ? " (primary)" : ""}
                  </div>
                  <div className="mt-2">
                    <Link href={`/parent/child/${l.students?.id}`} className="text-blue-700 hover:underline text-xs">
                      View results →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}