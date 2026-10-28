"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

// ─── Fee structure ────────────────────────────────────────
const structureSchema = z.object({
  session_id: z.string().uuid(),
  term_id: z.string().uuid(),
  class_id: z.string().uuid(),
  description: z.string().min(1),
  amount: z.coerce.number().min(0),
});

export async function createFeeStructure(
  _: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = structureSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation(
        "Check the form.",
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path[0] as string, i.message]),
        ),
      );
    }
    const s = await createServerSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (s.from("fee_structures") as any)
      .insert(parsed.data)
      .select("id")
      .single();
    if (error) throw Errors.internal("Could not create fee structure.");
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "fee_structure.create",
      entity: "fee_structures",
      entityId: data.id,
      after: parsed.data,
    });
    revalidatePath("/admin/fees");
    return { id: data.id };
  });
}

// ─── Assign structure to enrolment ───────────────────────
const assignSchema = z.object({
  enrolment_id: z.string().uuid(),
  fee_structure_id: z.string().uuid(),
  amount: z.coerce.number().min(0),
});

export async function assignFeeToEnrolment(
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = assignSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw Errors.validation("Check the form.");
    const s = await createServerSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (s.from("student_fee_assignments") as any).upsert(
      parsed.data,
      { onConflict: "enrolment_id,fee_structure_id" },
    );
    if (error) throw Errors.internal("Could not assign fee.");
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "fee.assign",
      entity: "student_fee_assignments",
      after: parsed.data,
    });
    revalidatePath("/admin/fees");
    return null;
  });
}

// ─── Record payment ──────────────────────────────────────
const paymentSchema = z.object({
  enrolment_id: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  method: z.enum(["cash", "bank_transfer", "cheque", "other"]),
  reference: z.string().optional(),
  note: z.string().optional(),
});

export async function recordPayment(
  _: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation(
        "Check the form.",
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path[0] as string, i.message]),
        ),
      );
    }
    const d = parsed.data;
    const s = await createServerSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (s.from("payments") as any)
      .insert({
        enrolment_id: d.enrolment_id,
        amount: d.amount,
        method: d.method,
        reference: d.reference || null,
        note: d.note || null,
        recorded_by: user.id,
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw Errors.conflict("That reference already exists.");
      throw Errors.internal("Could not record payment.");
    }
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "payment.record",
      entity: "payments",
      entityId: data.id,
      after: d,
    });
    revalidatePath("/admin/fees");
    return { id: data.id };
  });
}

export async function deletePayment(id: string): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const s = await createServerSupabase();
    const { error } = await s.from("payments").delete().eq("id", id);
    if (error) throw Errors.internal("Could not delete payment.");
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "payment.delete",
      entity: "payments",
      entityId: id,
    });
    revalidatePath("/admin/fees");
    return null;
  });
}