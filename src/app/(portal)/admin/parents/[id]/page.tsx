import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/db/server";
import { getParent, listStudentOptions, listSystemList } from "@/lib/people/queries";
import { ParentForm } from "../ParentForm";
import { LinkChildForm } from "./LinkChildForm";
import { ParentLoginCard } from "./ParentLoginCard";

export const metadata = { title: "Parent — Admin" };

export default async function ParentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ parent, links }, students, relationships] = await Promise.all([
    getParent(id),
    listStudentOptions(),
    listSystemList("relationship"),
  ]);
  if (!parent) notFound();

  const s = await createServerSupabase();
  const existingUser = parent.user_id
    ? (await s.from("users").select("email,is_active").eq("id", parent.user_id).single()).data
    : null;

  return (
    <div className="space-y-8">
      <ParentLoginCard parent={parent} existingUser={existingUser} />
      <ParentForm relationships={relationships} initial={parent} />

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Linked children</h2>
        {links.length === 0 ? (
          <p className="text-sm text-slate-500">No children linked yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {links.map((l: any, i: number) => (
              <li key={i} className="rounded border border-slate-200 p-3">
                <span className="font-mono text-xs text-slate-500">
                  {l.students?.admission_no}
                </span>{" "}
                {l.students?.surname}, {l.students?.first_name}
                <span className="ml-2 text-xs text-slate-500">
                  ({l.relationship}
                  {l.is_primary ? ", primary" : ""})
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <LinkChildForm parentId={id} students={students} relationships={relationships} />
        </div>
      </div>
    </div>
  );
}