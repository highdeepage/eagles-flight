import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { enrolmentFeeView } from "@/lib/fees/queries";
import { Card, CardBody, CardHeader, Empty } from "@/components/ui";
import { Receipt } from "lucide-react";

export const metadata = { title: "Enrolment fees — Admin" };

export default async function EnrolmentFeesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const data = await enrolmentFeeView(id);
  if (!data) notFound();

  const e = data.enrolment;
  const totalDue = data.assignments.reduce(
    (sum: number, a: any) => sum + Number(a.amount),
    0,
  );
  const totalPaid = data.payments.reduce(
    (sum: number, p: any) => sum + Number(p.amount),
    0,
  );
  const balance = totalDue - totalPaid;

  return (
    <div className="space-y-6">
      <Link href="/admin/fees" className="text-sm text-blue-700 hover:underline">
        ← Back to fees
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold">
          {e.students?.surname}, {e.students?.first_name}
        </h1>
        <p className="text-sm text-slate-500">
          {e.students?.admission_no} · {e.class_arms?.classes?.name} {e.class_arms?.arm_name} ·{" "}
          {e.terms?.academic_sessions?.name} — {e.terms?.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <div className="text-sm text-slate-500">Total due</div>
            <div className="mt-1 font-display text-2xl font-bold">
              ₦{totalDue.toLocaleString()}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-slate-500">Total paid</div>
            <div className="mt-1 font-display text-2xl font-bold text-green-700">
              ₦{totalPaid.toLocaleString()}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-slate-500">Balance</div>
            <div
              className={`mt-1 font-display text-2xl font-bold ${
                balance > 0 ? "text-red-700" : "text-green-700"
              }`}
            >
              ₦{balance.toLocaleString()}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Assigned fees" />
        <CardBody>
          {data.assignments.length === 0 ? (
            <p className="text-sm text-slate-500">No fees assigned yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.assignments.map((a: any) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2">{a.fee_structures?.description ?? "—"}</td>
                    <td className="py-2 text-right">₦{Number(a.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Payment history" icon={<Receipt className="h-4 w-4" />} />
        <CardBody>
          {data.payments.length === 0 ? (
            <Empty title="No payments yet" />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Method</th>
                  <th className="py-2">Reference</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 text-xs">
                      {new Date(p.recorded_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 capitalize">{p.method.replace("_", " ")}</td>
                    <td className="py-2 font-mono text-xs">{p.reference ?? "—"}</td>
                    <td className="py-2 text-right font-medium">
                      ₦{Number(p.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}