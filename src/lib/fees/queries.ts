import "server-only";
import { createServerSupabase } from "@/lib/db/server";

// ─── Types ─────────────────────────────────────────────────
export interface FeeStructure {
  id: string;
  session_id: string;
  term_id: string;
  class_id: string;
  description: string;
  amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sessions?: { name: string } | null;
  terms?: { name: string } | null;
  classes?: { name: string } | null;
}

export interface Payment {
  id: string;
  enrolment_id: string;
  amount: number;
  method: string;
  reference: string | null;
  note: string | null;
  recorded_by: string | null;
  recorded_at: string;
  created_at: string;
}

export interface EnrolmentOption {
  id: string;
  student_name: string;
  admission_no: string;
  class_name: string;
  arm_name: string;
}

// ─── Current term (shared) ─────────────────────────────────
export async function currentTerm() {
  const s = await createServerSupabase();
  const { data } = await s
    .from("terms")
    .select("id,name,session_id,academic_sessions(name)")
    .eq("is_current", true)
    .maybeSingle();
  return data as
    | { id: string; name: string; session_id: string; academic_sessions: { name: string } | null }
    | null;
}

// ─── Admin: list fee structures ────────────────────────────
export async function listFeeStructures(): Promise<FeeStructure[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("fee_structures")
    .select("*, academic_sessions:session_id(name), terms:term_id(name), classes:class_id(name)")
    .order("created_at", { ascending: false });
  return (data ?? []) as FeeStructure[];
}

// ─── Admin: options for creating a structure ──────────────
export async function listTermOptions() {
  const s = await createServerSupabase();
  const { data } = await s
    .from("terms")
    .select("id,name,session_id,academic_sessions:academic_sessions(name)")
    .order("name");
  return data ?? [];
}

export async function listClassOptions() {
  const s = await createServerSupabase();
  const { data } = await s.from("classes").select("id,name").order("name");
  return data ?? [];
}

// ─── Admin: enrolments for the current term ───────────────
export async function listEnrolmentsForTerm(termId: string): Promise<EnrolmentOption[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("enrolments")
    .select(
      "id, students(id,admission_no,surname,first_name), class_arms(arm_name,classes(name))",
    )
    .eq("term_id", termId)
    .eq("status", "enrolled")
    .order("created_at");

  return (data ?? []).map((e: any) => ({
    id: e.id,
    student_name: `${e.students?.surname ?? ""}, ${e.students?.first_name ?? ""}`,
    admission_no: e.students?.admission_no ?? "—",
    class_name: e.class_arms?.classes?.name ?? "—",
    arm_name: e.class_arms?.arm_name ?? "—",
  }));
}

// ─── Balance for one enrolment ────────────────────────────
export async function enrolmentBalance(enrolmentId: string) {
  const s = await createServerSupabase();

  const { data: assignments } = await s
    .from("student_fee_assignments")
    .select("amount, fee_structure_id, fee_structures:fee_structure_id(description)")
    .eq("enrolment_id", enrolmentId);

  const { data: payments } = await s
    .from("payments")
    .select("amount")
    .eq("enrolment_id", enrolmentId);

  const totalDue = (assignments ?? []).reduce(
    (sum: number, a: any) => sum + Number(a.amount ?? 0),
    0,
  );
  const totalPaid = (payments ?? []).reduce(
    (sum: number, p: any) => sum + Number(p.amount ?? 0),
    0,
  );

  return {
    totalDue,
    totalPaid,
    balance: totalDue - totalPaid,
    assignments: (assignments ?? []) as Array<{
      amount: number;
      fee_structure_id: string;
      fee_structures: { description: string } | null;
    }>,
  };
}

// ─── Full enrolment fee view ──────────────────────────────
export async function enrolmentFeeView(enrolmentId: string) {
  const s = await createServerSupabase();

  const { data: enrolment } = await s
    .from("enrolments")
    .select(
      "id, students(id,admission_no,surname,first_name), class_arms(arm_name,classes(name)), terms(id,name,academic_sessions(name))",
    )
    .eq("id", enrolmentId)
    .maybeSingle();

  if (!enrolment) return null;

  const { data: assignments } = await s
    .from("student_fee_assignments")
    .select("id, amount, fee_structure_id, fee_structures:fee_structure_id(description)")
    .eq("enrolment_id", enrolmentId);

  const { data: payments } = await s
    .from("payments")
    .select("id, amount, method, reference, note, recorded_at")
    .eq("enrolment_id", enrolmentId)
    .order("recorded_at", { ascending: false });

  return {
    enrolment: enrolment as any,
    assignments: (assignments ?? []) as any[],
    payments: (payments ?? []) as Payment[],
  };
}

// ─── Parent: their children's fees ────────────────────────
export async function parentChildrenFees(parentUserId: string) {
  const s = await createServerSupabase();

  const { data: parent } = await s
    .from("parents")
    .select("id")
    .eq("user_id", parentUserId)
    .maybeSingle();
  if (!parent) return [];

  const { data: links } = await s
    .from("parent_student")
    .select("students(id,admission_no,surname,first_name)")
    .eq("parent_id", (parent as any).id);

  const term = await currentTerm();
  if (!term) return [];

  const children = [];
  for (const l of links ?? []) {
    const stu = (l as any).students;
    if (!stu) continue;

    const { data: enrolment } = await s
      .from("enrolments")
      .select("id, class_arms(arm_name,classes(name))")
      .eq("student_id", stu.id)
      .eq("term_id", term.id)
      .maybeSingle();

    if (!enrolment) {
      children.push({
        student: stu,
        enrolment_id: null,
        class_name: null,
        term: `${(term as any).academic_sessions?.name} — ${term.name}`,
        balance: null,
      });
      continue;
    }

    const bal = await enrolmentBalance((enrolment as any).id);

    children.push({
      student: stu,
      enrolment_id: (enrolment as any).id,
      class_name: `${(enrolment as any).class_arms?.classes?.name ?? ""} ${(enrolment as any).class_arms?.arm_name ?? ""}`.trim(),
      term: `${(term as any).academic_sessions?.name} — ${term.name}`,
      balance: bal,
    });
  }

  return children;
}

// ─── Student: own fees ────────────────────────────────────
export async function studentOwnFees(studentUserId: string) {
  const s = await createServerSupabase();

  const { data: student } = await s
    .from("students")
    .select("id")
    .eq("user_id", studentUserId)
    .maybeSingle();
  if (!student) return null;

  const term = await currentTerm();
  if (!term) return null;

  const { data: enrolment } = await s
    .from("enrolments")
    .select("id")
    .eq("student_id", (student as any).id)
    .eq("term_id", term.id)
    .maybeSingle();
  if (!enrolment) return null;

  return await enrolmentBalance((enrolment as any).id);
}