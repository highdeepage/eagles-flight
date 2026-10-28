import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import {
  currentTerm,
  listFeeStructures,
  listEnrolmentsForTerm,
} from "@/lib/fees/queries";
import { Card, CardBody, CardHeader, Empty } from "@/components/ui";
import { Wallet, Plus, Users } from "lucide-react";
import { FeeStructureForm } from "./FeeStructureForm";
import { EnrolmentFeesTable } from "./EnrolmentFeesTable";

export const metadata = { title: "Fees — Admin" };

export default async function FeesAdminPage() {
  await requireAdmin();
  const term = await currentTerm();
  const [structures, enrolments] = await Promise.all([
    listFeeStructures(),
    term ? listEnrolmentsForTerm(term.id) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Fees</h1>
        <p className="mt-1 text-sm text-slate-500">
          {term
            ? `Current term: ${term.academic_sessions?.name ?? "—"} — ${term.name}`
            : "No current term set."}
        </p>
      </div>

      <Card>
        <CardHeader
          title="Fee structures"
          description="Amounts per class per term"
          icon={<Wallet className="h-4 w-4" />}
        />
        <CardBody>
          {structures.length === 0 ? (
            <Empty
              title="No fee structures yet"
              description="Create one on the right to start recording payments."
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Session</th>
                  <th className="py-2">Term</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {structures.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 text-xs">{(s as any).academic_sessions?.name ?? "—"}</td>
                    <td className="py-2 text-xs">{(s as any).terms?.name ?? "—"}</td>
                    <td className="py-2">{(s as any).classes?.name ?? "—"}</td>
                    <td className="py-2">{s.description}</td>
                    <td className="py-2 text-right font-medium">₦{Number(s.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-6 border-t pt-6">
            <h3 className="mb-3 font-display text-base font-semibold">New structure</h3>
            <FeeStructureForm />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Student balances"
          description="Current term · click any row for full history"
          icon={<Users className="h-4 w-4" />}
        />
        <CardBody>
          {enrolments.length === 0 ? (
            <Empty
              title="No students enrolled"
              description="Enrol students first, then assign fees here."
              action={
                <Link
                  href="/admin/enrolments"
                  className="text-sm text-blue-700 hover:underline"
                >
                  Go to enrolments →
                </Link>
              }
            />
          ) : (
            <EnrolmentFeesTable enrolments={enrolments} structures={structures} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}