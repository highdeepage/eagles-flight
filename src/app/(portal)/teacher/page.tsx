import Link from "next/link";
import { createServerSupabase } from "@/lib/db/server";
import { requireRole } from "@/lib/auth/session";
import { currentTerm } from "@/lib/attendance/queries";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Teacher Dashboard — Eagles Flight" };

export default async function TeacherDashboard() {
  const user = await requireRole("teacher", "class_teacher");
  const s = await createServerSupabase();
  const term = await currentTerm();

  const { data: assignments } = await s
    .from("teacher_assignments")
    .select("subjects(name,code), class_arms(arm_name,classes(name)), terms(name)")
    .eq("staff_id", user.id);

  const { data: myArm } = await s
    .from("class_arms")
    .select("id,arm_name,classes(name)")
    .eq("class_teacher_id", user.id)
    .maybeSingle();

  const rows = assignments ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {user.full_name ?? user.email}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {term
            ? `Current term: ${(term as any).academic_sessions?.name} — ${term.name}`
            : "No current term set."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/teacher/attendance">
          <Card className="hover:border-blue-300">
            <CardBody>
              <div className="text-sm text-slate-500">Take attendance</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                Open register
              </div>
            </CardBody>
          </Card>
        </Link>
        <Link href="/teacher/timetable">
          <Card className="hover:border-blue-300">
            <CardBody>
              <div className="text-sm text-slate-500">My timetable</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                View schedule
              </div>
            </CardBody>
          </Card>
        </Link>
        <Card>
          <CardBody>
            <div className="text-sm text-slate-500">My class</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              {myArm
                ? `${(myArm as any).classes?.name} ${(myArm as any).arm_name}`
                : "Not assigned"}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="My subject assignments"
          description={`${rows.length} this term`}
        />
        <CardBody>
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">
              No assignments yet. Ask an admin to assign you to subjects.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Subject</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Term</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="py-2">
                      {r.subjects?.code} — {r.subjects?.name}
                    </td>
                    <td className="py-2">
                      {r.class_arms?.classes?.name} — {r.class_arms?.arm_name}
                    </td>
                    <td className="py-2 text-xs text-slate-500">{r.terms?.name}</td>
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