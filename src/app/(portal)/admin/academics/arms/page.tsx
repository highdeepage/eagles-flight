import { listClasses, listClassArms, listTeacherOptions } from "@/lib/academics/queries";
import { Card, CardBody, CardHeader, InlineRowEditor } from "@/components/ui";
import { ArmsForm } from "./ArmsForm";

export const metadata = { title: "Class Arms — Admin" };

export default async function ArmsPage() {
  const [classes, arms, teachers] = await Promise.all([
    listClasses(),
    listClassArms(),
    listTeacherOptions(),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader title="All class arms" description={`${arms.length} arms`} />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Class</th>
                  <th className="py-2">Arm</th>
                  <th className="py-2">Class teacher</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {arms.map((a: any) => (
                  <tr key={a.id} className="border-b border-slate-100 align-top last:border-0">
                    <td className="py-2">{a.classes?.name}</td>
                    <td className="py-2 font-medium">{a.arm_name}</td>
                    <td className="py-2 text-slate-500">
                      {a.users?.full_name ?? a.users?.email ?? "—"}
                    </td>
                    <td className="py-2">
                      <InlineRowEditor
                        recordId={a.id}
                        updateAction="updateArm"
                        deleteAction="deleteArm"
                        deleteConfirm={`Delete arm "${a.arm_name}"?`}
                        fields={[
                          { name: "arm_name", label: "Arm name", defaultValue: a.arm_name, required: true },
                          {
                            name: "class_teacher_id",
                            label: "Class teacher",
                            type: "select",
                            defaultValue: a.class_teacher_id ?? "",
                            options: teachers.map((t) => ({
                              value: t.id,
                              label: t.full_name ?? t.email,
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
        <CardHeader title="New arm" />
        <CardBody>
          <ArmsForm classes={classes} teachers={teachers} />
        </CardBody>
      </Card>
    </div>
  );
}