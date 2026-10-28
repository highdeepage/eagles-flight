"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { recordPayment, assignFeeToEnrolment } from "@/lib/fees/actions";
import { Button, Input, Label, Select, useToast, InlineRowEditor } from "@/components/ui";
import { Plus, Wallet } from "lucide-react";
import type { EnrolmentOption, FeeStructure } from "@/lib/fees/queries";

export function EnrolmentFeesTable({
  enrolments,
  structures,
}: {
  enrolments: EnrolmentOption[];
  structures: FeeStructure[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const handleAssign = (enrolmentId: string, feeStructureId: string, amount: number) => {
    start(async () => {
      const fd = new FormData();
      fd.set("enrolment_id", enrolmentId);
      fd.set("fee_structure_id", feeStructureId);
      fd.set("amount", String(amount));
      const res = await assignFeeToEnrolment(null, fd);
      if (res.ok) {
        push("success", "Fee assigned.");
        router.refresh();
      } else {
        push("error", res.error.message);
      }
    });
  };

  const handlePay = (enrolmentId: string, form: FormData) => {
    form.set("enrolment_id", enrolmentId);
    start(async () => {
      const res = await recordPayment(null, form);
      if (res.ok) {
        push("success", "Payment recorded.");
        setPayingId(null);
        router.refresh();
      } else {
        push("error", res.error.message);
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">Student</th>
            <th className="py-2">Class</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrolments.map((e) => (
            <tr key={e.id} className="border-b border-slate-100 align-top last:border-0">
              <td className="py-2">
                <div className="font-medium">{e.student_name}</div>
                <div className="font-mono text-xs text-slate-500">{e.admission_no}</div>
              </td>
              <td className="py-2">
                {e.class_name} {e.arm_name}
              </td>
              <td className="py-2">
                <div className="flex flex-wrap justify-end gap-1">
                  <Link
                    href={`/admin/fees/${e.id}`}
                    className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                  >
                    View
                  </Link>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setAssigningId(assigningId === e.id ? null : e.id)}
                  >
                    Assign fee
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setPayingId(payingId === e.id ? null : e.id)}
                    icon={<Wallet className="h-3.5 w-3.5" />}
                  >
                    Record payment
                  </Button>
                </div>

                {assigningId === e.id && (
                  <div className="mt-2 rounded border border-blue-200 bg-blue-50/40 p-3 text-xs">
                    {structures.length === 0 ? (
                      <p>No fee structures created yet.</p>
                    ) : (
                      <div className="flex flex-wrap items-end gap-2">
                        <div>
                          <Label>Structure</Label>
                          <Select
                            defaultValue=""
                            onChange={(ev) => {
                              const st = structures.find((s) => s.id === ev.target.value);
                              if (!st) return;
                              handleAssign(e.id, st.id, Number(st.amount));
                            }}
                          >
                            <option value="">Choose…</option>
                            {structures.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.description} — ₦{Number(st.amount).toLocaleString()}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAssigningId(null)}
                          className="text-slate-500 underline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {payingId === e.id && (
                  <form
                    onSubmit={(ev) => {
                      ev.preventDefault();
                      handlePay(e.id, new FormData(ev.currentTarget));
                    }}
                    className="mt-2 grid gap-2 rounded border border-emerald-200 bg-emerald-50/40 p-3 text-xs sm:grid-cols-4"
                  >
                    <div>
                      <Label>Amount (₦)</Label>
                      <Input
                        name="amount"
                        type="number"
                        min={0.01}
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <Label>Method</Label>
                      <Select name="method" defaultValue="cash">
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank transfer</option>
                        <option value="cheque">Cheque</option>
                        <option value="other">Other</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Reference (optional)</Label>
                      <Input name="reference" placeholder="Receipt no / ref" />
                    </div>
                    <div className="flex items-end gap-1">
                      <Button type="submit" size="sm" loading={pending}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setPayingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}