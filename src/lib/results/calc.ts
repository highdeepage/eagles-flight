// Pure calculation helpers — unit-testable, no DB.

export interface ComponentScore {
  component_id: string;
  component_name: string;
  weight: number;      // e.g. 40 for CA
  max: number;         // usually 100 for each component (percentage-based)
  score: number;       // raw score the teacher entered (0..100)
}

export interface SubjectResult {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  components: ComponentScore[];
  total: number;       // weighted total, out of 100
  grade: string;
  remark: string;
}

export interface GradeBand {
  grade: string;
  min_score: number;
  max_score: number;
  remark: string | null;
}

/**
 * Computes the weighted total for a subject given its components and grade bands.
 * Each component's weight is a percentage of the final score.
 * Example: CA weight 40, Exam weight 60 → CA=30/100 → 12pts + Exam=70/100 → 42pts = 54.
 */
export function computeSubjectTotal(
  components: Array<{ weight: number; score: number }>,
): number {
  const total = components.reduce((sum, c) => sum + (c.score / 100) * c.weight, 0);
  return Math.round(total * 100) / 100;
}

export function lookupGrade(score: number, bands: GradeBand[]): { grade: string; remark: string } {
  const band = bands.find((b) => score >= b.min_score && score <= b.max_score);
  return { grade: band?.grade ?? "—", remark: band?.remark ?? "" };
}

export function computeAverage(totals: number[]): number {
  if (totals.length === 0) return 0;
  return Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 100) / 100;
}