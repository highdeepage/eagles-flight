import { currentTerm, listArmOptions, listEnrolmentsByTerm } from "@/lib/enrolments/queries";
import { createServerSupabase } from "@/lib/db/server";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { EnrolmentsManager } from "./EnrolmentsManager";

export const metadata = { title: "Enrolments — Admin" };

export default async function EnrolmentsPage() {
  const term = await currentTerm();

  if (!term) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Enrolments</h1>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-600">
              No current term set. Go to{" "}
              <a href="/admin/academics/terms" className="text-blue-700 hover:underline">
                Academics → Terms
              </a>{" "}
              and mark a term as current before enrolling students.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const [arms, enrolments] = await Promise.all([
    listArmOptions(),
    listEnrolmentsByTerm(term.id),
  ]);

  const s = await createServerSupabase();
  const { data: students } = await s
    .from("students")
    .select("id,admission_no,surname,first_name")
    .eq("status", "active")
    .order("surname");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Enrolments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Current term: {(term as any).academic_sessions?.name} — {term.name}
        </p>
      </div>

      <Card>
        <CardHeader title="Enrol a student" description="Assign a student to a class arm for the current term" />
        <CardBody>
          <EnrolmentsManager
            students={students ?? []}
            arms={arms}
            termId={term.id}
            sessionId={term.session_id}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Enrolled this term"
          description={`${enrolments.length} students`}
        />
        <CardBody>
          {enrolments.length === 0 ? (
            <p className="text-sm text-slate-500">No enrolments yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Student</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {enrolments.map((e: any) => (
                  <tr key={e.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2">
                      <span className="font-mono text-xs text-slate-500">
                        {e.students?.admission_no}
                      </span>{" "}
                      {e.students?.surname}, {e.students?.first_name}
                    </td>
                    <td className="py-2">
                      {e.class_arms?.classes?.name} — {e.class_arms?.arm_name}
                    </td>
                    <td className="py-2">{e.status}</td>
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