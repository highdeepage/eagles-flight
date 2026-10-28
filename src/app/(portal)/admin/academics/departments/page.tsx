import { listDepartments } from "@/lib/academics/queries";
import { Card, CardBody, CardHeader, InlineRowEditor } from "@/components/ui";
import { DepartmentsForm } from "./DepartmentsForm";

export const metadata = { title: "Departments — Admin" };

export default async function DepartmentsPage() {
  const depts = await listDepartments();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader title="All departments" description={`${depts.length}`} />
        <CardBody>
          {depts.length === 0 ? (
            <p className="text-sm text-slate-500">No departments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {depts.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100 align-top last:border-0">
                      <td className="py-2 font-medium">{d.name}</td>
                      <td className="py-2 text-slate-500">{d.description ?? "—"}</td>
                      <td className="py-2">
                        <InlineRowEditor
                          recordId={d.id}
                          updateAction="updateDepartment"
                          deleteAction="deleteDepartment"
                          deleteConfirm={`Delete department "${d.name}"?`}
                          fields={[
                            { name: "name", label: "Name", defaultValue: d.name, required: true },
                            { name: "description", label: "Description", defaultValue: d.description ?? "" },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="New department" />
        <CardBody>
          <DepartmentsForm />
        </CardBody>
      </Card>
    </div>
  );
}