import { listClasses } from "@/lib/academics/queries";
import { ClassesForm } from "./ClassesForm";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Classes — Admin" };

export default async function ClassesPage() {
  const classes = await listClasses();
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader title="All classes" description={`${classes.length} classes`} />
        <CardBody>
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Level</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 font-medium">{c.name}</td>
                  <td className="py-2">{c.level ?? "—"}</td>
                  <td className="py-2 text-slate-500">{c.description ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="New class" />
        <CardBody>
          <ClassesForm />
        </CardBody>
      </Card>
    </div>
  );
}