"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

const scoreSaveSchema = z.object({
  enrolment_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  term_id: z.string().uuid(),
  scores: z.record(z.string().uuid(), z.coerce.number().min(0).max(100)),
});

/** Teacher saves draft scores. Does not submit. */
export async function saveScores(payload: z.infer<typeof scoreSaveSchema>): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireUser();
    const parsed = scoreSaveSchema.safeParse(payload);
    if (!parsed.success) throw Errors.validation("Invalid scores.");

    const s = await createServerSupabase();

    // Check submission isn't already approved/published
    const { data: existing } = await s
      .from("result_submissions")
      .select("status")
      .eq("enrolment_id", parsed.data.enrolment_id)
      .eq("subject_id", parsed.data.subject_id)
      .eq("term_id", parsed.data.term_id)
      .maybeSingle();

    if (existing && ["approved", "published"].includes(existing.status)) {
      throw Errors.forbidden("Results are already approved or published.");
    }

    // Upsert each component score
    const rows = Object.entries(parsed.data.scores).map(([component_id, score]) => ({
      enrolment_id: parsed.data.enrolment_id,
      subject_id: parsed.data.subject_id,
      component_id,
      score,
      entered_by: user.id,
    }));

    const { error } = await s
      .from("result_records")
      .upsert(rows, { onConflict: "enrolment_id,subject_id,component_id" });

    if (error) throw Errors.internal("Could not save scores.");

    // Ensure submission row exists with status 'draft' (or keep existing)
    await s.from("result_submissions").upsert(
      {
        enrolment_id: parsed.data.enrolment_id,
        subject_id: parsed.data.subject_id,
        term_id: parsed.data.term_id,
        status: existing?.status === "returned" ? "draft" : existing?.status ?? "draft",
      },
      { onConflict: "enrolment_id,subject_id,term_id" },
    );

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "results.save_draft",
      entity: "result_records",
      after: parsed.data,
    });

    revalidatePath("/teacher/results");
    return null;
  });
}

export async function submitScores(
  enrolmentId: string,
  subjectId: string,
  termId: string,
): Promise<void> {
  const user = await requireUser();
  const s = await createServerSupabase();
  const { error } = await s
    .from("result_submissions")
    .upsert(
      {
        enrolment_id: enrolmentId,
        subject_id: subjectId,
        term_id: termId,
        status: "submitted",
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "enrolment_id,subject_id,term_id" },
    );
  if (error) throw Errors.internal("Could not submit.");
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "results.submit",
    entity: "result_submissions",
    after: { enrolmentId, subjectId, termId },
  });
  revalidatePath("/teacher/results");
  revalidatePath("/admin/results/review");
}

export async function approveSubmission(id: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  const { error } = await s
    .from("result_submissions")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw Errors.internal("Could not approve.");
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "results.approve",
    entity: "result_submissions",
    entityId: id,
  });
  revalidatePath("/admin/results/review");
}

export async function returnSubmission(id: string, reason: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  const { error } = await s
    .from("result_submissions")
    .update({ status: "returned", return_reason: reason })
    .eq("id", id);
  if (error) throw Errors.internal("Could not return.");
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "results.return",
    entity: "result_submissions",
    entityId: id,
    after: { reason },
  });
  revalidatePath("/admin/results/review");
}

export async function publishSubmission(id: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  const { error } = await s
    .from("result_submissions")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw Errors.internal("Could not publish.");
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "results.publish",
    entity: "result_submissions",
    entityId: id,
  });
  revalidatePath("/admin/results/review");
}

export async function publishAllApproved(termId: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  const { error } = await s
    .from("result_submissions")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("term_id", termId)
    .eq("status", "approved");
  if (error) throw Errors.internal("Could not publish all.");
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "results.publish_all",
    entity: "result_submissions",
    after: { termId },
  });
  revalidatePath("/admin/results/review");
}