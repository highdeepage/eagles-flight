import Link from "next/link";
import { listStudents } from "@/lib/people/queries";
import { Card, CardBody, CardHeader, Button, Empty, InlineRowEditor } from "@/components/ui";
import { UserPlus, Users } from "lucide-react";

export const metadata = { title: "Students — Admin" };

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const p = await searchParams;
  const { rows, total, page, pageSize } = await listStudents({
    search: p.q,
    page: Number(p.page ?? "1"),
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Students</h1>
          <p className="mt-1 text-sm text-slate-500">{total} records</p>
        </div>
        <Link href="/admin/students/new">
          <Button icon={<UserPlus className="h-4 w-4" />}>New student</Button>
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={p.q ?? ""}
          placeholder="Search by name or admission number"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <Card>
        <CardHeader title="All students" icon={<Users className="h-4 w-4" />} />
        <CardBody>
          {rows.length === 0 ? (
            <Empty
              icon={<Users className="h-10 w-10" />}
              title="No students yet"
              description="Register your first student to get started."
              action={
                <Link href="/admin/students/new">
                  <Button>Register student</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Admission no</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Gender</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 align-top last:border-0">
                      <td className="py-2 font-mono text-xs">{s.admission_no}</td>
                      <td className="py-2">
                        <Link
                          href={`/admin/students/${s.id}`}
                          className="text-blue-700 hover:underline"
                        >
                          {s.surname}, {s.first_name} {s.other_names ?? ""}
                        </Link>
                      </td>
                      <td className="py-2 capitalize">{s.gender}</td>
                      <td className="py-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            s.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2">
                        <InlineRowEditor
                          recordId={s.id}
                          updateAction="updateStudent"
                          deleteAction="deleteStudent"
                          deleteConfirm={`Delete ${s.surname}, ${s.first_name}? This cannot be undone.`}
                          fields={[
                            { name: "admission_no", label: "Admission no", defaultValue: s.admission_no, required: true },
                            { name: "surname", label: "Surname", defaultValue: s.surname, required: true },
                            { name: "first_name", label: "First name", defaultValue: s.first_name, required: true },
                            { name: "other_names", label: "Other names", defaultValue: s.other_names ?? "" },
                            {
                              name: "gender",
                              label: "Gender",
                              type: "select",
                              defaultValue: s.gender,
                              options: [
                                { value: "male", label: "Male" },
                                { value: "female", label: "Female" },
                              ],
                              required: true,
                            },
                            { name: "phone", label: "Phone", defaultValue: s.phone ?? "" },
                            {
                              name: "status",
                              label: "Status",
                              type: "select",
                              defaultValue: s.status,
                              options: [
                                { value: "active", label: "Active" },
                                { value: "graduated", label: "Graduated" },
                                { value: "withdrawn", label: "Withdrawn" },
                                { value: "suspended", label: "Suspended" },
                                { value: "archived", label: "Archived" },
                              ],
                              required: true,
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between">
              <Link
                href={`/admin/students?q=${p.q ?? ""}&page=${Math.max(1, page - 1)}`}
                className={page === 1 ? "pointer-events-none text-slate-300" : "text-blue-700"}
              >
                ← Previous
              </Link>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <Link
                href={`/admin/students?q=${p.q ?? ""}&page=${Math.min(totalPages, page + 1)}`}
                className={page === totalPages ? "pointer-events-none text-slate-300" : "text-blue-700"}
              >
                Next →
              </Link>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}