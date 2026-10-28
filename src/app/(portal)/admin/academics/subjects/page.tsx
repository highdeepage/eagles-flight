import { listDepartments, listSubjects } from "@/lib/academics/queries";
import { Card, CardBody, CardHeader, InlineRowEditor } from "@/components/ui";
import { SubjectsForm } from "./SubjectsForm";

export const metadata = { title: "Subjects — Admin" };

export default async function SubjectsPage() {
  const [subjects, departments] = await Promise.all([
    listSubjects(),
    listDepartments(),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader title="All subjects" description={`${subjects.length}`} />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Code</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Department</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s: any) => (
                  <tr key={s.id} className="border-b border-slate-100 align-top last:border-0">
                    <td className="py-2 font-mono text-xs">{s.code}</td>
                    <td className="py-2 font-medium">{s.name}</td>
                    <td className="py-2 text-slate-500">{s.departments?.name ?? "—"}</td>
                    <td className="py-2">
                      <InlineRowEditor
                        recordId={s.id}
                        updateAction="updateSubject"
                        deleteAction="deleteSubject"
                        deleteConfirm={`Delete subject "${s.code} — ${s.name}"?`}
                        fields={[
                          { name: "code", label: "Code", defaultValue: s.code, required: true },
                          { name: "name", label: "Name", defaultValue: s.name, required: true },
                          {
                            name: "department_id",
                            label: "Department",
                            type: "select",
                            defaultValue: s.department_id ?? "",
                            options: departments.map((d) => ({
                              value: d.id,
                              label: d.name,
                            })),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="New subject" />
        <CardBody>
          <SubjectsForm departments={departments} />
        </CardBody>
      </Card>
    </div>
  );
}