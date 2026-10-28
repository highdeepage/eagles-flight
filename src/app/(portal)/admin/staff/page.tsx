import Link from "next/link";
import { listStaff } from "@/lib/people/queries";
import { Card, CardBody, CardHeader, Button, Empty, InlineRowEditor } from "@/components/ui";
import { UserPlus, UserCheck } from "lucide-react";

export const metadata = { title: "Staff — Admin" };

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const p = await searchParams;
  const { rows, total, page, pageSize } = await listStaff({
    search: p.q,
    page: Number(p.page ?? "1"),
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Staff</h1>
          <p className="mt-1 text-sm text-slate-500">{total} records</p>
        </div>
        <Link href="/admin/staff/new">
          <Button icon={<UserPlus className="h-4 w-4" />}>New staff</Button>
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={p.q ?? ""}
          placeholder="Search name or staff number"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <Card>
        <CardHeader title="All staff" icon={<UserCheck className="h-4 w-4" />} />
        <CardBody>
          {rows.length === 0 ? (
            <Empty
              icon={<UserCheck className="h-10 w-10" />}
              title="No staff yet"
              description="Add your first staff member to get started."
              action={
                <Link href="/admin/staff/new">
                  <Button>Add staff</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Staff no</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Dept</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s: any) => (
                    <tr key={s.id} className="border-b border-slate-100 align-top last:border-0">
                      <td className="py-2 font-mono text-xs">{s.staff_no}</td>
                      <td className="py-2">
                        <Link
                          href={`/admin/staff/${s.id}`}
                          className="text-blue-700 hover:underline"
                        >
                          {s.surname}, {s.first_name}
                        </Link>
                      </td>
                      <td className="py-2 text-slate-500">{s.departments?.name ?? "—"}</td>
                      <td className="py-2">{s.employment_status}</td>
                      <td className="py-2">
                        <InlineRowEditor
                          recordId={s.id}
                          updateAction="updateStaff"
                          deleteAction="deleteStaff"
                          deleteConfirm={`Delete ${s.surname}, ${s.first_name}?`}
                          fields={[
                            { name: "staff_no", label: "Staff no", defaultValue: s.staff_no, required: true },
                            { name: "surname", label: "Surname", defaultValue: s.surname, required: true },
                            { name: "first_name", label: "First name", defaultValue: s.first_name, required: true },
                            { name: "other_names", label: "Other names", defaultValue: s.other_names ?? "" },
                            { name: "phone", label: "Phone", defaultValue: s.phone ?? "" },
                            { name: "email", label: "Email", defaultValue: s.email ?? "" },
                            { name: "designation", label: "Designation", defaultValue: s.designation ?? "" },
                            {
                              name: "employment_status",
                              label: "Status",
                              type: "select",
                              defaultValue: s.employment_status,
                              options: [
                                { value: "active", label: "Active" },
                                { value: "on_leave", label: "On Leave" },
                                { value: "suspended", label: "Suspended" },
                                { value: "resigned", label: "Resigned" },
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
                href={`/admin/staff?q=${p.q ?? ""}&page=${Math.max(1, page - 1)}`}
                className={page === 1 ? "pointer-events-none text-slate-300" : "text-blue-700"}
              >
                ← Previous
              </Link>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <Link
                href={`/admin/staff?q=${p.q ?? ""}&page=${Math.min(totalPages, page + 1)}`}
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