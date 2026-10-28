import { createServerSupabase } from "@/lib/db/server";
import { requireRole } from "@/lib/auth/session";
import { currentTerm } from "@/lib/attendance/queries";
import { AttendanceRegister } from "../../admin/attendance/AttendanceRegister";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Attendance — Teacher" };

export default async function TeacherAttendancePage() {
  const user = await requireRole("teacher", "class_teacher");
  const s = await createServerSupabase();

  const { data: assignedArms } = await s
    .from("teacher_assignments")
    .select("class_arms(id,arm_name,classes(name))")
    .eq("staff_id", user.id);

  const { data: ownArm } = await s
    .from("class_arms")
    .select("id,arm_name,classes(name)")
    .eq("class_teacher_id", user.id)
    .maybeSingle();

  const armMap = new Map<string, any>();
  for (const a of assignedArms ?? []) {
    if ((a as any).class_arms) {
      armMap.set((a as any).class_arms.id, (a as any).class_arms);
    }
  }
  if (ownArm) armMap.set((ownArm as any).id, ownArm);
  const arms = Array.from(armMap.values());

  const term = await currentTerm();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">
          {term
            ? `Current term: ${(term as any).academic_sessions?.name} — ${term.name}`
            : "No current term set."}
        </p>
      </div>
      <Card>
        <CardHeader title="My classes" />
        <CardBody>
          {arms.length === 0 ? (
            <p className="text-sm text-slate-500">
              You have no assigned classes yet.
            </p>
          ) : (
            <AttendanceRegister arms={arms} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}