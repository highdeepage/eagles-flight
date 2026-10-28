import Link from "next/link";
import { createServerSupabase } from "@/lib/db/server";
import { currentTerm, listReportCardsForTerm } from "@/lib/results/queries";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Report Cards — Admin" };

export default async function ReportCardsPage() {
  const term = await currentTerm();
  if (!term) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Report Cards</h1>
        <Card><CardBody>No current term set.</CardBody></Card>
      </div>
    );
  }

  const rows = await listReportCardsForTerm(term.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Report Cards</h1>
        <p className="mt-1 text-sm text-slate-500">
          {(term as any).academic_sessions?.name} — {term.name}
        </p>
      </div>
      <Card>
        <CardHeader title="Students" description={`${rows.length} enrolments this term`} />
        <CardBody>
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">No students enrolled for this term.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Student</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Subjects published</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any) => {
                  const subs = (r.result_submissions ?? []) as any[];
                  const publishedCount = subs.filter((s) => s.status === "published").length;
                  const total = subs.length;
                  return (
                    <tr key={r.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2">
                        <span className="font-mono text-xs text-slate-500">{r.students?.admission_no}</span>{" "}
                        {r.students?.surname}, {r.students?.first_name}
                      </td>
                      <td className="py-2">{r.class_arms?.classes?.name} — {r.class_arms?.arm_name}</td>
                      <td className="py-2">
                        <span className={publishedCount === total && total > 0 ? "text-green-700" : "text-slate-500"}>
                          {publishedCount} / {total}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <Link
                          href={`/admin/report-cards/${r.id}`}
                          className="text-blue-700 hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}