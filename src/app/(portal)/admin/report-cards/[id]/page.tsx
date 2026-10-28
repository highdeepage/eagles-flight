import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { reportCardData } from "@/lib/results/queries";
import { computeAverage } from "@/lib/results/calc";

export const metadata = { title: "Report Card — Admin" };

export default async function ReportCardViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const data = await reportCardData(id);
  if (!data) notFound();

  const s = await createServerSupabase();
  const { data: settings } = await s
    .from("school_settings")
    .select("school_name,logo_url,motto,principal_name")
    .eq("id", 1)
    .single();

  const e = data.enrolment;
  const totals = data.subjects.map((sub) => sub.total);
  const average = computeAverage(totals);
  const position = "—"; // computed only when all students in class have published results

  return (
    <div className="space-y-4">
      <div className="flex justify-between print:hidden">
        <Link href="/admin/report-cards" className="text-sm text-blue-700 hover:underline">
          ← Back
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-md bg-blue-700 px-3 py-1.5 text-sm text-white hover:bg-blue-800"
        >
          Print / Save as PDF
        </button>
      </div>

      <div className="mx-auto max-w-3xl rounded-lg border border-slate-300 bg-white p-8 print:border-0 print:p-0">
        <div className="flex items-center justify-between border-b border-slate-300 pb-4">
          <div className="flex items-center gap-3">
            {settings?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo_url} alt="" className="h-12 w-12 object-contain" />
            )}
            <div>
              <div className="text-lg font-bold">{settings?.school_name}</div>
              <div className="text-xs text-slate-600">{settings?.motto}</div>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Terminal Report</div>
            <div>{e.terms?.academic_sessions?.name} — {e.terms?.name}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500">Name:</span>{" "}
            <strong>{e.students?.surname}, {e.students?.first_name} {e.students?.other_names ?? ""}</strong>
          </div>
          <div><span className="text-slate-500">Admission:</span> {e.students?.admission_no}</div>
          <div><span className="text-slate-500">Class:</span> {e.class_arms?.classes?.name} — {e.class_arms?.arm_name}</div>
          <div><span className="text-slate-500">Gender:</span> {e.students?.gender ?? "—"}</div>
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-slate-300 bg-slate-50 text-xs uppercase text-slate-600">
              <th className="py-1 text-left">Subject</th>
              {data.subjects[0]?.components.map((c) => (
                <th key={c.component_id} className="py-1 text-right">{c.component_name} ({c.weight})</th>
              ))}
              <th className="py-1 text-right">Total</th>
              <th className="py-1 text-center">Grade</th>
              <th className="py-1 text-left">Remark</th>
            </tr>
          </thead>
          <tbody>
            {data.subjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-3 text-center text-slate-500">
                  No published results yet.
                </td>
              </tr>
            ) : (
              data.subjects.map((sub) => (
                <tr key={sub.subject_id} className="border-b border-slate-200">
                  <td className="py-1">{sub.subject_name}</td>
                  {sub.components.map((c) => (
                    <td key={c.component_id} className="py-1 text-right">{c.score}</td>
                  ))}
                  <td className="py-1 text-right font-medium">{sub.total.toFixed(1)}</td>
                  <td className="py-1 text-center font-semibold">{sub.grade}</td>
                  <td className="py-1 text-xs">{sub.remark}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div><span className="text-slate-500">Subjects:</span> {data.subjects.length}</div>
          <div><span className="text-slate-500">Average:</span> {average.toFixed(2)}</div>
          <div><span className="text-slate-500">Position:</span> {position}</div>
        </div>

        <div className="mt-8 space-y-6 text-xs">
          <div className="border-t pt-2">
            <div className="text-slate-500">Class Teacher's Comment</div>
            <div className="mt-1 h-8" />
          </div>
          <div className="border-t pt-2">
            <div className="text-slate-500">Principal's Comment</div>
            <div className="mt-1 h-8" />
            <div className="mt-3 text-right">{settings?.principal_name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}