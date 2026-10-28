import { listArmsForRegister, currentTerm } from "@/lib/attendance/queries";
import { AttendanceRegister } from "./AttendanceRegister";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Attendance — Admin" };

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ arm?: string; date?: string }>;
}) {
  const p = await searchParams;
  const [arms, term] = await Promise.all([listArmsForRegister(), currentTerm()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">
          {term
            ? `Current term: ${term.academic_sessions?.name ?? "—"} — ${term.name}`
            : "No current term set."}
        </p>
      </div>

      <Card>
        <CardHeader title="Take attendance" />
        <CardBody>
          <AttendanceRegister arms={arms} initialArm={p.arm} initialDate={p.date} />
        </CardBody>
      </Card>
    </div>
  );
}