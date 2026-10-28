import { listSessions, listTerms } from "@/lib/academics/queries";
import { TermsForm } from "./TermsForm";
import { SetCurrentTermButton } from "./SetCurrentTermButton";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Terms — Admin" };

export default async function TermsPage() {
  const [sessions, terms] = await Promise.all([listSessions(), listTerms()]);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader title="All terms" description={`${terms.length} terms`} />
        <CardBody>
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Session</th>
                <th className="py-2">Name</th>
                <th className="py-2">Dates</th>
                <th className="py-2">Current</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {terms.map((t: any) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2">{t.academic_sessions?.name}</td>
                  <td className="py-2 font-medium">{t.name}</td>
                  <td className="py-2 text-xs text-slate-500">
                    {t.start_date ?? "—"} → {t.end_date ?? "—"}
                  </td>
                  <td className="py-2">
                    {t.is_current ? (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        Current
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <SetCurrentTermButton id={t.id} isCurrent={t.is_current} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="New term" />
        <CardBody>
          <TermsForm sessions={sessions} />
        </CardBody>
      </Card>
    </div>
  );
}