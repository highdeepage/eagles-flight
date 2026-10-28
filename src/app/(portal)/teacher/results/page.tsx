import { requireRole } from "@/lib/auth/session";
import { currentTerm } from "@/lib/results/queries";
import { subjectScoresForTeacher } from "@/lib/results/queries";
import { createServerSupabase } from "@/lib/db/server";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { ResultEntry } from "./ResultEntry";

export const metadata = { title: "Results — Teacher" };

export default async function TeacherResultsPage() {
  const user = await requireRole("teacher", "class_teacher");
  const term = await currentTerm();

  if (!term) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Results</h1>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-600">No current term set.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const groups = await subjectScoresForTeacher(user.id, term.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Results</h1>
        <p className="mt-1 text-sm text-slate-500">
          {(term as any).academic_sessions?.name} — {term.name}
        </p>
      </div>
      {groups.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">
              No subjects assigned to you for this term, or no students enrolled yet.
            </p>
          </CardBody>
        </Card>
      ) : (
        groups.map((g) => (
          <Card key={`${g.subject_id}-${g.class_arm_id}`}>
            <CardHeader
              title={`${g.subject?.code} — ${g.subject?.name}`}
              description={`${g.students.length} students`}
            />
            <CardBody>
              <ResultEntry group={g} termId={term.id} />
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}