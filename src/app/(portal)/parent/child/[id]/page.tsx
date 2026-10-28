import Link from "next/link";
import { createServerSupabase } from "@/lib/db/server";
import { requireRole } from "@/lib/auth/session";
import { currentTerm, reportCardData } from "@/lib/results/queries";
import { computeAverage } from "@/lib/results/calc";
import { notFound } from "next/navigation";

export const metadata = { title: "Child Results — Parent" };

export default async function ParentChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("parent");
  const { id } = await params;
  const s = await createServerSupabase();

  // Verify parent-child link (RLS also enforces, this is a friendlier message)
  const { data: parent } = await s.from("parents").select("id").eq("user_id", user.id).maybeSingle();
  const { data: link } = parent
    ? await s.from("parent_student").select("student_id").eq("parent_id", parent.id).eq("student_id", id).maybeSingle()
    : { data: null };

  if (!link) notFound();

  const { data: student } = await s.from("students").select("surname,first_name,admission_no").eq("id", id).single();
  const term = await currentTerm();

  const { data: enrolment } = term
    ? await s.from("enrolments").select("id").eq("student_id", id).eq("term_id", term.id).maybeSingle()
    : { data: null };

  const data = enrolment ? await reportCardData((enrolment as any).id) : null;
  const average = data ? computeAverage(data.subjects.map((x) => x.total)) : 0;

  return (
    <div className="space-y-4">
      <Link href="/parent" className="text-sm text-blue-700 hover:underline">← Back</Link>
      <div>
        <h1 className="text-2xl font-bold">{student?.surname}, {student?.first_name}</h1>
        <p className="text-sm text-slate-500">
          {student?.admission_no} · {term ? `${(term as any).academic_sessions?.name} — ${term.name}` : "No term"}
        </p>
      </div>

      {!data || data.subjects.length === 0 ? (
        <p className="text-sm text-slate-500">No published results yet.</p>
      ) : (
        <>
          <div className="text-sm">
            <span className="text-slate-500">Average:</span> {average.toFixed(2)}
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-y bg-slate-50 text-xs uppercase text-slate-600">
                <th className="py-1 text-left">Subject</th>
                <th className="py-1 text-right">Total</th>
                <th className="py-1 text-center">Grade</th>
                <th className="py-1 text-left">Remark</th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((sub) => (
                <tr key={sub.subject_id} className="border-b">
                  <td className="py-1">{sub.subject_name}</td>
                  <td className="py-1 text-right">{sub.total.toFixed(1)}</td>
                  <td className="py-1 text-center font-semibold">{sub.grade}</td>
                  <td className="py-1 text-xs">{sub.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}