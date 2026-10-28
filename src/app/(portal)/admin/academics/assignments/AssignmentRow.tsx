"use client";

import { useTransition } from "react";
import { deleteAssignment } from "@/lib/academics/actions";
import { useToast } from "@/components/ui";

export function AssignmentRow({ row }: { row: any }) {
  const [pending, start] = useTransition();
  const { push } = useToast();

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2">{row.users?.full_name ?? row.users?.email ?? "—"}</td>
      <td className="py-2">{row.subjects?.code} — {row.subjects?.name}</td>
      <td className="py-2">{row.class_arms?.classes?.name} — {row.class_arms?.arm_name}</td>
      <td className="py-2 text-xs text-slate-500">{row.terms?.name}</td>
      <td className="py-2 text-right">
        <button
          disabled={pending}
          onClick={() => start(async () => {
            try { await deleteAssignment(row.id); push("success", "Removed."); }
            catch { push("error", "Failed."); }
          })}
          className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {pending ? "…" : "Remove"}
        </button>
      </td>
    </tr>
  );
}