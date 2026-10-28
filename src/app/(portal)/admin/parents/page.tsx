import Link from "next/link";
import { listParents } from "@/lib/people/queries";
import { Card, CardBody, CardHeader, Button, Empty, InlineRowEditor } from "@/components/ui";
import { UserPlus, Users } from "lucide-react";

export const metadata = { title: "Parents — Admin" };

export default async function ParentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const p = await searchParams;
  const { rows, total, page, pageSize } = await listParents({
    search: p.q,
    page: Number(p.page ?? "1"),
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Parents</h1>
          <p className="mt-1 text-sm text-slate-500">{total} records</p>
        </div>
        <Link href="/admin/parents/new">
          <Button icon={<UserPlus className="h-4 w-4" />}>New parent</Button>
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={p.q ?? ""}
          placeholder="Search name or email"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <Card>
        <CardHeader title="All parents" icon={<Users className="h-4 w-4" />} />
        <CardBody>
          {rows.length === 0 ? (
            <Empty
              icon={<Users className="h-10 w-10" />}
              title="No parents yet"
              description="Add a parent to get started."
              action={
                <Link href="/admin/parents/new">
                  <Button>Add parent</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Phone</th>
                    <th className="py-2">Email</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: any) => (
                    <tr key={row.id} className="border-b border-slate-100 align-top last:border-0">
                      <td className="py-2">
                        <Link
                          href={`/admin/parents/${row.id}`}
                          className="text-blue-700 hover:underline"
                        >
                          {row.surname}, {row.first_name}
                        </Link>
                      </td>
                      <td className="py-2">{row.phone ?? "—"}</td>
                      <td className="py-2">{row.email ?? "—"}</td>
                      <td className="py-2">
                        <InlineRowEditor
                          recordId={row.id}
                          updateAction="updateParent"
                          deleteAction="deleteParent"
                          deleteConfirm={`Delete ${row.surname}? Linked children links will be removed too.`}
                          fields={[
                            { name: "surname", label: "Surname", defaultValue: row.surname, required: true },
                            { name: "first_name", label: "First name", defaultValue: row.first_name, required: true },
                            { name: "other_names", label: "Other names", defaultValue: row.other_names ?? "" },
                            { name: "phone", label: "Phone", defaultValue: row.phone ?? "" },
                            { name: "email", label: "Email", defaultValue: row.email ?? "" },
                            { name: "occupation", label: "Occupation", defaultValue: row.occupation ?? "" },
                            { name: "address", label: "Address", defaultValue: row.address ?? "" },
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
                href={`/admin/parents?q=${p.q ?? ""}&page=${Math.max(1, page - 1)}`}
                className={page === 1 ? "pointer-events-none text-slate-300" : "text-blue-700"}
              >
                ← Previous
              </Link>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <Link
                href={`/admin/parents?q=${p.q ?? ""}&page=${Math.min(totalPages, page + 1)}`}
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