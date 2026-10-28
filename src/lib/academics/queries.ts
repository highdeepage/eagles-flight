import "server-only";
import { createServerSupabase } from "@/lib/db/server";

// ─── Row types ──────────────────────────────────────────────
export interface AcademicSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TermRow {
  id: string;
  session_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  academic_sessions?: { name: string } | null;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClassRow {
  id: string;
  name: string;
  level: number | null;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClassArm {
  id: string;
  class_id: string;
  arm_name: string;
  class_teacher_id: string | null;
  created_at?: string;
  updated_at?: string;
  classes?: { name: string } | null;
  users?: { full_name: string | null; email: string } | null;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department_id: string | null;
  created_at?: string;
  updated_at?: string;
  departments?: { name: string } | null;
}

export interface TeacherAssignment {
  id: string;
  staff_id: string;
  subject_id: string;
  class_arm_id: string;
  term_id: string;
  created_at?: string;
  updated_at?: string;
  subjects?: { name: string; code: string } | null;
  class_arms?: {
    arm_name: string;
    classes?: { name: string } | null;
  } | null;
  users?: { full_name: string | null; email: string } | null;
  terms?: { name: string } | null;
}

export interface AssessmentComponentRow {
  id: string;
  term_id: string;
  name: string;
  weight: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  terms?: { name: string } | null;
}

export interface GradingScheme {
  id: string;
  name: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GradeBand {
  id: string;
  scheme_id: string;
  grade: string;
  min_score: number;
  max_score: number;
  remark: string | null;
  sort_order: number;
  created_at?: string;
}

export interface TeacherOption {
  id: string;
  email: string;
  full_name: string | null;
}

// ─── Sessions ───────────────────────────────────────────────
export async function listSessions(): Promise<AcademicSession[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("academic_sessions")
    .select("*")
    .order("start_date", { ascending: false });
  return (data ?? []) as AcademicSession[];
}

// ─── Terms ──────────────────────────────────────────────────
export async function listTerms(sessionId?: string): Promise<TermRow[]> {
  const s = await createServerSupabase();
  let q = s
    .from("terms")
    .select("*, academic_sessions(name)")
    .order("sort_order");
  if (sessionId) q = q.eq("session_id", sessionId);
  const { data } = await q;
  return (data ?? []) as TermRow[];
}

// ─── Departments ────────────────────────────────────────────
export async function listDepartments(): Promise<Department[]> {
  const s = await createServerSupabase();
  const { data } = await s.from("departments").select("*").order("name");
  return (data ?? []) as Department[];
}

// ─── Classes ────────────────────────────────────────────────
export async function listClasses(): Promise<ClassRow[]> {
  const s = await createServerSupabase();
  const { data } = await s.from("classes").select("*").order("level");
  return (data ?? []) as ClassRow[];
}

// ─── Class arms ─────────────────────────────────────────────
export async function listClassArms(classId?: string): Promise<ClassArm[]> {
  const s = await createServerSupabase();
  let q = s
    .from("class_arms")
    .select("*, classes(name), users:class_teacher_id(full_name,email)")
    .order("arm_name");
  if (classId) q = q.eq("class_id", classId);
  const { data } = await q;
  return (data ?? []) as ClassArm[];
}

// ─── Subjects ───────────────────────────────────────────────
export async function listSubjects(): Promise<Subject[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("subjects")
    .select("*, departments(name)")
    .order("name");
  return (data ?? []) as Subject[];
}

// ─── Teacher assignments ────────────────────────────────────
export async function listTeacherAssignments(
  termId?: string,
): Promise<TeacherAssignment[]> {
  const s = await createServerSupabase();
  let q = s
    .from("teacher_assignments")
    .select(
      "*, subjects(name,code), class_arms(arm_name, classes(name)), users:staff_id(full_name,email), terms(name)",
    )
    .order("created_at", { ascending: false });
  if (termId) q = q.eq("term_id", termId);
  const { data } = await q;
  return (data ?? []) as TeacherAssignment[];
}

// ─── Assessment components ──────────────────────────────────
export async function listAssessmentComponents(
  termId?: string,
): Promise<AssessmentComponentRow[]> {
  const s = await createServerSupabase();
  let q = s
    .from("assessment_components")
    .select("*, terms(name)")
    .order("sort_order");
  if (termId) q = q.eq("term_id", termId);
  const { data } = await q;
  return (data ?? []) as AssessmentComponentRow[];
}

// ─── Grading schemes ────────────────────────────────────────
export async function listGradingSchemes(): Promise<GradingScheme[]> {
  const s = await createServerSupabase();
  const { data } = await s.from("grading_schemes").select("*").order("name");
  return (data ?? []) as GradingScheme[];
}

// ─── Grade bands ────────────────────────────────────────────
export async function listGradeBands(schemeId: string): Promise<GradeBand[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("grade_bands")
    .select("*")
    .eq("scheme_id", schemeId)
    .order("sort_order");
  return (data ?? []) as GradeBand[];
}

// ─── Teacher options ────────────────────────────────────────
export async function listTeacherOptions(): Promise<TeacherOption[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("users")
    .select("id,email,full_name")
    .in("role", ["teacher", "class_teacher"])
    .eq("is_active", true)
    .order("full_name");
  return (data ?? []) as TeacherOption[];
}