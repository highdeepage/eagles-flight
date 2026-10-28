import "server-only";
import { createServerSupabase } from "@/lib/db/server";

// ─── Row types ──────────────────────────────────────────────
export interface TermInfo {
  id: string;
  name: string;
  session_id: string;
  academic_sessions: { name: string } | null;
}

export interface ArmOption {
  id: string;
  arm_name: string;
  classes: { name: string } | null;
}

export interface StudentRow {
  id: string;
  admission_no: string;
  surname: string;
  first_name: string;
  other_names: string | null;
  photo_path: string | null;
}

export interface ExistingAttendanceRow {
  student_id: string;
  status: string;
  note: string | null;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percent: number;
}

// ─── Current term ───────────────────────────────────────────
export async function currentTerm(): Promise<TermInfo | null> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("terms")
    .select("id,name,session_id,academic_sessions(name)")
    .eq("is_current", true)
    .maybeSingle();
  return (data as TermInfo | null) ?? null;
}

// ─── Arms ───────────────────────────────────────────────────
export async function listArmsForRegister(): Promise<ArmOption[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("class_arms")
    .select("id,arm_name,classes(name)")
    .order("arm_name");
  return (data ?? []) as ArmOption[];
}

// ─── Students in an arm ─────────────────────────────────────
export async function listStudentsInArm(armId: string): Promise<StudentRow[]> {
  const s = await createServerSupabase();

  const { data: term } = await s
    .from("terms")
    .select("id")
    .eq("is_current", true)
    .maybeSingle();
  if (!term) return [];

  const { data } = await s
    .from("enrolments")
    .select("students(id,surname,first_name,other_names,admission_no,photo_path)")
    .eq("class_arm_id", armId)
    .eq("term_id", term.id)
    .eq("status", "enrolled")
    .order("students(surname)");

  return ((data ?? []) as Array<{ students: StudentRow | null }>)
    .map((r) => r.students)
    .filter((x): x is StudentRow => x !== null);
}

// ─── Existing attendance for a date ─────────────────────────
export async function attendanceForDate(
  armId: string,
  date: string,
): Promise<ExistingAttendanceRow[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("attendance_records")
    .select("student_id,status,note")
    .eq("class_arm_id", armId)
    .eq("date", date);
  return (data ?? []) as ExistingAttendanceRow[];
}

// ─── Attendance summary for a student ───────────────────────
export async function attendanceSummary(
  studentId: string,
  termId: string,
): Promise<AttendanceSummary> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("attendance_records")
    .select("status")
    .eq("student_id", studentId)
    .eq("term_id", termId);

  const rows = (data ?? []) as Array<{ status: string }>;
  const total = rows.length;
  const present = rows.filter((r) => r.status === "present").length;

  return {
    total,
    present,
    absent: rows.filter((r) => r.status === "absent").length,
    late: rows.filter((r) => r.status === "late").length,
    excused: rows.filter((r) => r.status === "excused").length,
    percent: total > 0 ? Math.round((present / total) * 100) : 0,
  };
}