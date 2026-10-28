import "server-only";
import { createServerSupabase } from "@/lib/db/server";

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

export interface StudentOption {
  id: string;
  admission_no: string;
  surname: string;
  first_name: string;
}

export interface EnrolmentRow {
  id: string;
  status: string;
  students: {
    id: string;
    admission_no: string;
    surname: string;
    first_name: string;
    other_names: string | null;
  } | null;
  class_arms: {
    arm_name: string;
    classes: { name: string } | null;
  } | null;
}

export async function currentTerm(): Promise<TermInfo | null> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("terms")
    .select("id,name,session_id,academic_sessions(name)")
    .eq("is_current", true)
    .maybeSingle();
  return (data as TermInfo | null) ?? null;
}

export async function listArmOptions(): Promise<ArmOption[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("class_arms")
    .select("id,arm_name,classes(name)")
    .order("arm_name");
  return (data ?? []) as ArmOption[];
}

export async function listStudentOptions(): Promise<StudentOption[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("students")
    .select("id,admission_no,surname,first_name")
    .eq("status", "active")
    .order("surname");
  return (data ?? []) as StudentOption[];
}

export async function listEnrolmentsByTerm(termId: string): Promise<EnrolmentRow[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("enrolments")
    .select(
      "id,status,students(id,admission_no,surname,first_name,other_names),class_arms(arm_name,classes(name))",
    )
    .eq("term_id", termId)
    .order("created_at", { ascending: false });
  return (data ?? []) as EnrolmentRow[];
}