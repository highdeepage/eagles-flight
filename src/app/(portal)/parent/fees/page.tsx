import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { parentChildrenFees } from "@/lib/fees/queries";
import { Card, CardBody, CardHeader, Empty } from "@/components/ui";
import { Wallet, Receipt } from "lucide-react";

export const metadata = { title: "Fees — Parent Portal" };

export default async function ParentFeesPage() {
  const user = await requireRole("parent");
  const children = await parentChildrenFees(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Fees</h1>
        <p className="mt-1 text-sm text-slate-500">
          Current term balance for each of your children.
        </p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardBody>
            <Empty
              icon={<Wallet className="h-10 w-10" />}
              title="No children linked"
              description="Contact the school office to link your children to your account."
            />
          </CardBody>
        </Card>
      ) : (
        children.map((c: any, i: number) => (
          <Card key={i}>
            <CardHeader
              title={`${c.student.surname}, ${c.student.first_name}`}
              description={`${c.student.admission_no}${c.class_name ? ` · ${c.class_name}` : ""} · ${c.term}`}
              icon={<Wallet className="h-4 w-4" />}
            />
            <CardBody>
              {!c.balance ? (
                <p className="text-sm text-slate-500">
                  Not enrolled this term — no fees assigned.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <div className="text-xs text-slate-500">Total due</div>
                      <div className="font-display text-xl font-semibold">
                        ₦{c.balance.totalDue.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Paid</div>
                      <div className="font-display text-xl font-semibold text-green-700">
                        ₦{c.balance.totalPaid.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Balance</div>
                      <div
                        className={`font-display text-xl font-semibold ${
                          c.balance.balance > 0 ? "text-red-700" : "text-green-700"
                        }`}
                      >
                        ₦{c.balance.balance.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {c.enrolment_id && (
                    <Link
                      href={`/parent/child/${c.student.id}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      View full history →
                    </Link>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}