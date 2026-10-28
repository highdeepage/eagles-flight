import "server-only";
import { createServerSupabase } from "@/lib/db/server";
import { lookupGrade, type GradeBand } from "./calc";

export async function currentTerm() {
  const s = await createServerSupabase();
  const { data } = await s
    .from("terms")
    .select("id,name,session_id,academic_sessions(name)")
    .eq("is_current", true)
    .maybeSingle();
  return data;
}

/** For teacher score entry: enrolments + assigned subjects + component scores. */
export async function subjectScoresForTeacher(staffUserId: string, termId: string) {
  const s = await createServerSupabase();

  // Get teacher's assignments for this term
  const { data: assignments } = await s
    .from("teacher_assignments")
    .select("subject_id, class_arm_id, subjects(name,code)")
    .eq("staff_id", staffUserId)
    .eq("term_id", termId);

  if (!assignments || assignments.length === 0) return [];

  // Get enrolments for each assigned arm
  const armIds = [...new Set(assignments.map((a) => a.class_arm_id))];
  const { data: enrolments } = await s
    .from("enrolments")
    .select("id,class_arm_id,students(id,admission_no,surname,first_name)")
    .in("class_arm_id", armIds)
    .eq("term_id", termId)
    .eq("status", "enrolled");

  if (!enrolments) return [];

  const subjectIds = [...new Set(assignments.map((a) => a.subject_id))];
  const { data: components } = await s
    .from("assessment_components")
    .select("id,name,weight,sort_order")
    .eq("term_id", termId)
    .order("sort_order");

  const { data: existingScores } = await s
    .from("result_records")
    .select("enrolment_id,subject_id,component_id,score")
    .in("subject_id", subjectIds)
    .in("enrolment_id", enrolments.map((e) => e.id));

  const scoreMap = new Map<string, number>();
  for (const r of existingScores ?? []) {
    scoreMap.set(`${r.enrolment_id}:${r.subject_id}:${r.component_id}`, Number(r.score));
  }

  return (assignments as any[]).map((a) => ({
    subject_id: a.subject_id,
    subject: a.subjects,
    class_arm_id: a.class_arm_id,
    components: components ?? [],
    students: (enrolments ?? [])
      .filter((e) => e.class_arm_id === a.class_arm_id)
      .map((e: any) => ({
        enrolment_id: e.id,
        student: e.students,
        scores: Object.fromEntries(
          (components ?? []).map((c) => [
            c.id,
            scoreMap.get(`${e.id}:${a.subject_id}:${c.id}`) ?? null,
          ]),
        ),
      })),
  }));
}

/** Get grade bands for the default scheme. */
export async function defaultGradeBands(): Promise<GradeBand[]> {
  const s = await createServerSupabase();
  const { data: scheme } = await s
    .from("grading_schemes")
    .select("id")
    .eq("is_default", true)
    .maybeSingle();
  if (!scheme) return [];
  const { data } = await s
    .from("grade_bands")
    .select("grade,min_score,max_score,remark")
    .eq("scheme_id", scheme.id)
    .order("sort_order");
  return (data ?? []) as GradeBand[];
}

/** For admin review: submitted results grouped by teacher. */
export async function listSubmissionsByStatus(termId: string, status?: string) {
  const s = await createServerSupabase();
  let q = s
    .from("result_submissions")
    .select(
      "id,status,submitted_at,approved_at,published_at,return_reason,students:enrolment_id(enrolment_id,students(id,surname,first_name,admission_no),class_arms(arm_name,classes(name))),subjects(name,code),terms(name)",
    )
    .eq("term_id", termId)
    .order("submitted_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return data ?? [];
}

/** Report card data for one enrolment (student × term). */
export async function reportCardData(enrolmentId: string) {
  const s = await createServerSupabase();
  const { data: enrolment } = await s
    .from("enrolments")
    .select(
      "id,class_arms(arm_name,classes(name)),students(id,admission_no,surname,first_name,other_names,gender,date_of_birth,photo_path),terms(id,name,academic_sessions(name))",
    )
    .eq("id", enrolmentId)
    .maybeSingle();
  if (!enrolment) return null;

  const termId = (enrolment as any).terms?.id;
  const { data: submissions } = await s
    .from("result_submissions")
    .select("id,subject_id,status,subjects(name,code)")
    .eq("enrolment_id", enrolmentId)
    .eq("term_id", termId);

  const { data: components } = await s
    .from("assessment_components")
    .select("id,name,weight")
    .eq("term_id", termId);

  const { data: scores } = await s
    .from("result_records")
    .select("subject_id,component_id,score")
    .eq("enrolment_id", enrolmentId);

  const bands = await defaultGradeBands();

  const subjectResults = (submissions ?? [])
    .filter((sub) => sub.status === "published" || sub.status === "approved")
    .map((sub: any) => {
      const comps = (components ?? []).map((c) => {
        const row = (scores ?? []).find(
          (r) => r.subject_id === sub.subject_id && r.component_id === c.id,
        );
        return {
          component_id: c.id,
          component_name: c.name,
          weight: c.weight,
          max: 100,
          score: row ? Number(row.score) : 0,
        };
      });
      const total = comps.reduce((sum, c) => sum + (c.score / 100) * c.weight, 0);
      const grade = lookupGrade(total, bands);
      return {
        subject_id: sub.subject_id,
        subject_name: sub.subjects?.name,
        subject_code: sub.subjects?.code,
        components: comps,
        total: Math.round(total * 100) / 100,
        grade: grade.grade,
        remark: grade.remark,
      };
    });

  return {
    enrolment: enrolment as any,
    subjects: subjectResults,
  };
}

/** List all enrolments that have all subjects approved/published for report card view. */
export async function listReportCardsForTerm(termId: string) {
  const s = await createServerSupabase();
  const { data } = await s
    .from("enrolments")
    .select(
      "id,students(id,admission_no,surname,first_name),class_arms(arm_name,classes(name)),result_submissions(status)",
    )
    .eq("term_id", termId);
  return data ?? [];
}