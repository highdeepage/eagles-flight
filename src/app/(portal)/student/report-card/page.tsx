import Link from "next/link";
import { createServerSupabase } from "@/lib/db/server";
import { requireRole } from "@/lib/auth/session";
import { currentTerm, reportCardData } from "@/lib/results/queries";
import { computeAverage } from "@/lib/results/calc";

export const metadata = { title: "My Report Card — Student" };

export default async function StudentReportCardPage() {
  const user = await requireRole("student");
  const s = await createServerSupabase();
  const term = await currentTerm();
  if (!term) return <p className="text-sm text-slate-500">No current term set.</p>;

  const { data: student } = await s
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!student) return <p className="text-sm text-slate-500">No student record linked.</p>;

  const { data: enrolment } = await s
    .from("enrolments")
    .select("id")
    .eq("student_id", student.id)
    .eq("term_id", term.id)
    .maybeSingle();

  if (!enrolment) return <p className="text-sm text-slate-500">Not enrolled for this term.</p>;

  const data = await reportCardData((enrolment as any).id);
  if (!data || data.subjects.length === 0) {
    return <p className="text-sm text-slate-500">No published results yet.</p>;
  }

  const { data: settings } = await s
    .from("school_settings")
    .select("school_name,logo_url,motto")
    .eq("id", 1)
    .single();

  const e = data.enrolment;
  const average = computeAverage(data.subjects.map((s) => s.total));

  return (
    <div className="space-y-4">
      <div className="flex justify-between print:hidden">
        <Link href="/student" className="text-sm text-blue-700 hover:underline">← Back</Link>
        <button
          onClick={() => window.print()}
          className="rounded-md bg-blue-700 px-3 py-1.5 text-sm text-white hover:bg-blue-800"
        >
          Print
        </button>
      </div>
      <div className="mx-auto max-w-3xl rounded-lg border bg-white p-8 print:border-0">
        <div className="flex items-center gap-3 border-b pb-4">
          {settings?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt="" className="h-12 w-12 object-contain" />
          )}
          <div>
            <div className="text-lg font-bold">{settings?.school_name}</div>
            <div className="text-xs text-slate-600">{settings?.motto}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500">Name:</span> {e.students?.surname}, {e.students?.first_name}</div>
          <div><span className="text-slate-500">Class:</span> {e.class_arms?.classes?.name} — {e.class_arms?.arm_name}</div>
          <div><span className="text-slate-500">Term:</span> {(term as any).academic_sessions?.name} — {term.name}</div>
          <div><span className="text-slate-500">Average:</span> {average.toFixed(2)}</div>
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y bg-slate-50 text-xs uppercase text-slate-600">
              <th className="py-1 text-left">Subject</th>
              {data.subjects[0]?.components.map((c) => (
                <th key={c.component_id} className="py-1 text-right">{c.component_name}</th>
              ))}
              <th className="py-1 text-right">Total</th>
              <th className="py-1 text-center">Grade</th>
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((sub) => (
              <tr key={sub.subject_id} className="border-b">
                <td className="py-1">{sub.subject_name}</td>
                {sub.components.map((c) => (
                  <td key={c.component_id} className="py-1 text-right">{c.score}</td>
                ))}
                <td className="py-1 text-right font-medium">{sub.total.toFixed(1)}</td>
                <td className="py-1 text-center font-semibold">{sub.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}