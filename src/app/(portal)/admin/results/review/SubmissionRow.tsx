"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveSubmission, publishSubmission, returnSubmission } from "@/lib/results/actions";
import { useToast, Button } from "@/components/ui";

export function SubmissionRow({ row }: { row: any }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-slate-100 text-slate-700",
      submitted: "bg-amber-100 text-amber-700",
      approved: "bg-blue-100 text-blue-700",
      published: "bg-green-100 text-green-700",
      returned: "bg-red-100 text-red-700",
    };
    return <span className={`rounded px-2 py-0.5 text-xs ${colors[status] ?? ""}`}>{status}</span>;
  };

  const handleApprove = () => start(async () => {
    try { await approveSubmission(row.id); push("success", "Approved."); router.refresh(); }
    catch { push("error", "Failed."); }
  });

  const handlePublish = () => start(async () => {
    try { await publishSubmission(row.id); push("success", "Published."); router.refresh(); }
    catch { push("error", "Failed."); }
  });

  const handleReturn = () => {
    const reason = prompt("Reason for return:");
    if (!reason) return;
    start(async () => {
      try { await returnSubmission(row.id, reason); push("success", "Returned."); router.refresh(); }
      catch { push("error", "Failed."); }
    });
  };

  const student = row.students?.students;
  const arm = row.students?.class_arms;

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2">
        <div>
          <span className="font-mono text-xs text-slate-500">{student?.admission_no}</span>{" "}
          {student?.surname}, {student?.first_name}
        </div>
        <div className="text-xs text-slate-500">{arm?.classes?.name} — {arm?.arm_name}</div>
      </td>
      <td className="py-2">{row.subjects?.code} — {row.subjects?.name}</td>
      <td className="py-2">{statusBadge(row.status)}</td>
      <td className="py-2 text-xs text-slate-500">
        {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : "—"}
      </td>
      <td className="py-2 text-right">
        <div className="flex justify-end gap-1">
          {row.status === "submitted" && (
            <>
              <Button size="sm" onClick={handleApprove} disabled={pending}>Approve</Button>
              <Button size="sm" variant="secondary" onClick={handleReturn} disabled={pending}>Return</Button>
            </>
          )}
          {row.status === "approved" && (
            <Button size="sm" onClick={handlePublish} disabled={pending}>Publish</Button>
          )}
        </div>
      </td>
    </tr>
  );
}