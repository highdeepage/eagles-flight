import {
  listAssessmentComponents,
  listGradeBands,
  listGradingSchemes,
  listTerms,
  type GradingScheme,
} from "@/lib/academics/queries";
import { AssessmentForm } from "./AssessmentForm";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Assessment & Grading — Admin" };

export default async function AssessmentPage() {
  const [components, terms, schemes] = await Promise.all([
    listAssessmentComponents(),
    listTerms(),
    listGradingSchemes(),
  ]);

  const schemeList: GradingScheme[] = schemes;
  const scheme: GradingScheme | undefined =
    schemeList.find((s) => s.is_default) ?? schemeList[0];

  const bands = scheme ? await listGradeBands(scheme.id) : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Assessment components"
            description="CA / Exam weights per term"
          />
          <CardBody>
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Term</th>
                  <th className="py-2">Component</th>
                  <th className="py-2">Weight</th>
                </tr>
              </thead>
              <tbody>
                {components.map((c: any) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 text-xs">{c.terms?.name}</td>
                    <td className="py-2 font-medium">{c.name}</td>
                    <td className="py-2">{c.weight}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 border-t pt-4">
              <AssessmentForm terms={terms} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={`Grading: ${scheme?.name ?? "—"}`}
            description="Grade bands"
          />
          <CardBody>
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Grade</th>
                  <th className="py-2">Range</th>
                  <th className="py-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                {bands.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 font-semibold">{b.grade}</td>
                    <td className="py-2">
                      {b.min_score}–{b.max_score}
                    </td>
                    <td className="py-2 text-slate-500">{b.remark ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}