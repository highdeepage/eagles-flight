import { currentTerm, listSubmissionsByStatus } from "@/lib/results/queries";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { SubmissionRow } from "./SubmissionRow";

export const metadata = { title: "Review Results — Admin" };

export default async function ReviewResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const p = await searchParams;
  const term = await currentTerm();

  if (!term) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Review Results</h1>
        <Card>
          <CardBody>No current term set.</CardBody>
        </Card>
      </div>
    );
  }

  const submissions = await listSubmissionsByStatus(term.id, p.status);

  const tabs = [
    { key: "", label: "All" },
    { key: "submitted", label: "Awaiting review" },
    { key: "approved", label: "Approved" },
    { key: "published", label: "Published" },
    { key: "returned", label: "Returned" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Review Results</h1>
        <p className="mt-1 text-sm text-slate-500">
          {(term as any).academic_sessions?.name} — {term.name}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <a
            key={t.key}
            href={`/admin/results/review${t.key ? `?status=${t.key}` : ""}`}
            className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-sm ${
              (p.status ?? "") === t.key
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-300 text-slate-700"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      <Card>
        <CardHeader title="Submissions" description={`${submissions.length}`} />
        <CardBody>
          {submissions.length === 0 ? (
            <p className="text-sm text-slate-500">No submissions found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Student</th>
                  <th className="py-2">Subject</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Submitted</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub: any) => (
                  <SubmissionRow key={sub.id} row={sub} />
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}