import {
  listTeacherAssignments,
  listTerms,
  listSubjects,
  listClassArms,
  listTeacherOptions,
} from "@/lib/academics/queries";
import { AssignmentsForm } from "./AssignmentsForm";
import { AssignmentRow } from "./AssignmentRow";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Teacher Assignments — Admin" };

export default async function AssignmentsPage() {
  const [assignments, terms, subjects, arms, teachers] = await Promise.all([
    listTeacherAssignments(),
    listTerms(),
    listSubjects(),
    listClassArms(),
    listTeacherOptions(),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader
          title="Assignments"
          description={`${assignments.length} active assignments`}
        />
        <CardBody>
          {assignments.length === 0 ? (
            <p className="text-sm text-slate-500">No assignments yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Teacher</th>
                  <th className="py-2">Subject</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Term</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {assignments.map((a: any) => (
                  <AssignmentRow key={a.id} row={a} />
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="New assignment" />
        <CardBody>
          <AssignmentsForm
            teachers={teachers}
            subjects={subjects}
            arms={arms}
            terms={terms}
          />
        </CardBody>
      </Card>
    </div>
  );
}