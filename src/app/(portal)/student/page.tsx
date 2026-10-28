import Link from "next/link";
import { createServerSupabase } from "@/lib/db/server";
import { requireRole } from "@/lib/auth/session";
import { currentTerm } from "@/lib/results/queries";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Student Portal — Eagles Flight" };

export default async function StudentDashboard() {
  const user = await requireRole("student");
  const s = await createServerSupabase();
  const term = await currentTerm();

  const { data: student } = await s
    .from("students")
    .select("id,admission_no,surname,first_name,photo_path")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: enrolment } = student && term
    ? await s
        .from("enrolments")
        .select("id,class_arms(arm_name,classes(name))")
        .eq("student_id", student.id)
        .eq("term_id", term.id)
        .maybeSingle()
    : { data: null };

  const { data: subs } = enrolment
    ? await s
        .from("result_submissions")
        .select("status,subjects(name,code)")
        .eq("enrolment_id", (enrolment as any).id)
        .eq("term_id", term!.id)
    : { data: [] as any[] };

  const published = (subs ?? []).filter((r: any) => r.status === "published");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {student?.first_name ?? user.full_name ?? user.email}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {student?.admission_no} · {enrolment ? `${(enrolment as any).class_arms?.classes?.name} ${(enrolment as any).class_arms?.arm_name}` : "Not enrolled"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <div className="text-sm text-slate-500">Current term</div>
            <div className="mt-2 text-lg font-semibold">
              {term ? `${(term as any).academic_sessions?.name} — ${term.name}` : "—"}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-slate-500">Subjects with published results</div>
            <div className="mt-2 text-lg font-semibold">
              {published.length} / {(subs ?? []).length}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="My results this term" />
        <CardBody>
          {!enrolment ? (
            <p className="text-sm text-slate-500">You have not been enrolled for this term yet.</p>
          ) : published.length === 0 ? (
            <p className="text-sm text-slate-500">No results published yet.</p>
          ) : (
            <>
              <ul className="space-y-1 text-sm">
                {published.map((r: any, i: number) => (
                  <li key={i}>{r.subjects?.code} — {r.subjects?.name}</li>
                ))}
              </ul>
              <Link
                href="/student/report-card"
                className="mt-4 inline-block text-sm text-blue-700 hover:underline"
              >
                View report card →
              </Link>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}