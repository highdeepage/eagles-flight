"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

// ── Sessions ────────────────────────────────────────────────
const sessionSchema = z.object({
  name: z.string().min(1, "Name is required."),
  start_date: z.string().min(1, "Start date required."),
  end_date: z.string().min(1, "End date required."),
});

export async function createSession(
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = sessionSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation("Check the form.",
        Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])));
    }
    const s = await createServerSupabase();
    const { error } = await s.from("academic_sessions").insert(parsed.data);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("Session name already exists.");
      throw Errors.internal("Could not create session.");
    }
    await logAudit({ actorId: user.id, actorEmail: user.email, action: "session.create", entity: "academic_sessions", after: parsed.data });
    revalidatePath("/admin/academics/sessions");
    return null;
  });
}

export async function setCurrentSession(id: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  // Clear all other currents first (constraint requires only one)
  await s.from("academic_sessions").update({ is_current: false }).eq("is_current", true);
  const { error } = await s.from("academic_sessions").update({ is_current: true }).eq("id", id);
  if (error) throw Errors.internal("Could not set current session.");
  await logAudit({ actorId: user.id, actorEmail: user.email, action: "session.set_current", entity: "academic_sessions", entityId: id });
  revalidatePath("/admin/academics/sessions");
}

// ── Terms ───────────────────────────────────────────────────
const termSchema = z.object({
  session_id: z.string().uuid(),
  name: z.string().min(1, "Name is required."),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  sort_order: z.coerce.number().int().default(0),
});

export async function createTerm(
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = termSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation("Check the form.",
        Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])));
    }
    const s = await createServerSupabase();
    const payload = {
      session_id: parsed.data.session_id,
      name: parsed.data.name,
      start_date: parsed.data.start_date || null,
      end_date: parsed.data.end_date || null,
      sort_order: parsed.data.sort_order,
    };
    const { error } = await s.from("terms").insert(payload);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("Term with that name already exists in this session.");
      throw Errors.internal("Could not create term.");
    }
    await logAudit({ actorId: user.id, actorEmail: user.email, action: "term.create", entity: "terms", after: payload });
    revalidatePath("/admin/academics/terms");
    return null;
  });
}

export async function setCurrentTerm(id: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  const { data: t } = await s.from("terms").select("session_id").eq("id", id).single();
  if (!t) throw Errors.notFound("Term not found.");
  await s.from("terms").update({ is_current: false }).eq("session_id", t.session_id).eq("is_current", true);
  await s.from("terms").update({ is_current: true }).eq("id", id);
  await logAudit({ actorId: user.id, actorEmail: user.email, action: "term.set_current", entity: "terms", entityId: id });
  revalidatePath("/admin/academics/terms");
}

// ── Departments ─────────────────────────────────────────────
const deptSchema = z.object({ name: z.string().min(1), description: z.string().optional() });

export async function createDepartment(_: ActionResult<null> | null, formData: FormData): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = deptSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw Errors.validation("Check the form.");
    const s = await createServerSupabase();
    const { error } = await s.from("departments").insert(parsed.data);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("A department with that name already exists.");
      throw Errors.internal("Could not create department.");
    }
    await logAudit({ actorId: user.id, actorEmail: user.email, action: "department.create", entity: "departments", after: parsed.data });
    revalidatePath("/admin/academics/departments");
    return null;
  });
}

// ── Classes ─────────────────────────────────────────────────
const classSchema = z.object({
  name: z.string().min(1),
  level: z.coerce.number().int().optional(),
  description: z.string().optional(),
});

export async function createClass(_: ActionResult<null> | null, formData: FormData): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = classSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw Errors.validation("Check the form.");
    const s = await createServerSupabase();
    const { error } = await s.from("classes").insert(parsed.data);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("A class with that name already exists.");
      throw Errors.internal("Could not create class.");
    }
    await logAudit({ actorId: user.id, actorEmail: user.email, action: "class.create", entity: "classes", after: parsed.data });
    revalidatePath("/admin/academics/classes");
    return null;
  });
}

// ── Class arms ──────────────────────────────────────────────
const armSchema = z.object({
  class_id: z.string().uuid(),
  arm_name: z.string().min(1),
  class_teacher_id: z.string().uuid().optional().or(z.literal("")),
});

export async function createArm(_: ActionResult<null> | null, formData: FormData): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = armSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw Errors.validation("Check the form.");
    const s = await createServerSupabase();
    const payload = {
      class_id: parsed.data.class_id,
      arm_name: parsed.data.arm_name,
      class_teacher_id: parsed.data.class_teacher_id || null,
    };
    const { error } = await s.from("class_arms").insert(payload);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("That arm already exists for this class.");
      throw Errors.internal("Could not create arm.");
    }
    await logAudit({ actorId: user.id, actorEmail: user.email, action: "arm.create", entity: "class_arms", after: payload });
    revalidatePath("/admin/academics/arms");
    return null;
  });
}

// ── Subjects ────────────────────────────────────────────────
const subjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).regex(/^[A-Z0-9]{2,6}$/, "2–6 uppercase letters/numbers."),
  department_id: z.string().uuid().optional().or(z.literal("")),
});

export async function createSubject(_: ActionResult<null> | null, formData: FormData): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = subjectSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation("Check the form.",
        Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])));
    }
    const s = await createServerSupabase();
    const payload = {
      name: parsed.data.name,
      code: parsed.data.code,
      department_id: parsed.data.department_id || null,
    };
    const { error } = await s.from("subjects").insert(payload);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("A subject with that code already exists.");
      throw Errors.internal("Could not create subject.");
    }
    await logAudit({ actorId: user.id, actorEmail: user.email, action: "subject.create", entity: "subjects", after: payload });
    revalidatePath("/admin/academics/subjects");
    return null;
  });
}

// ── Teacher assignments ─────────────────────────────────────
const taSchema = z.object({
  staff_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  class_arm_id: z.string().uuid(),
  term_id: z.string().uuid(),
});

export async function createAssignment(_: ActionResult<null> | null, formData: FormData): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = taSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation("All fields required.",
        Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])));
    }
    const s = await createServerSupabase();
    const { error } = await s.from("teacher_assignments").insert(parsed.data);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("This teacher is already assigned to that subject/class/term.");
      throw Errors.internal("Could not create assignment.");
    }
    await logAudit({ actorId: user.id, actorEmail: user.email, action: "assignment.create", entity: "teacher_assignments", after: parsed.data });
    revalidatePath("/admin/academics/assignments");
    return null;
  });
}

export async function deleteAssignment(id: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  const { error } = await s.from("teacher_assignments").delete().eq("id", id);
  if (error) throw Errors.internal("Could not delete assignment.");
  await logAudit({ actorId: user.id, actorEmail: user.email, action: "assignment.delete", entity: "teacher_assignments", entityId: id });
  revalidatePath("/admin/academics/assignments");
}

// ── Assessment components ───────────────────────────────────
const acSchema = z.object({
  term_id: z.string().uuid(),
  name: z.string().min(1),
  weight: z.coerce.number().int().min(1).max(100),
  sort_order: z.coerce.number().int().default(0),
});

export async function createComponent(_: ActionResult<null> | null, formData: FormData): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = acSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw Errors.validation("Check the form.");
    const s = await createServerSupabase();

    // Validate: total weights for this term must not exceed 100
    const { data: existing } = await s
      .from("assessment_components")
      .select("weight")
      .eq("term_id", parsed.data.term_id);
    const currentTotal = (existing ?? []).reduce((sum, r: any) => sum + (r.weight ?? 0), 0);
    if (currentTotal + parsed.data.weight > 100) {
      throw Errors.validation(`Adding ${parsed.data.weight} would exceed 100%. Current total: ${currentTotal}%.`);
    }

    const { error } = await s.from("assessment_components").insert(parsed.data);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("That component already exists in this term.");
      throw Errors.internal("Could not create component.");
    }
    await logAudit({ actorId: user.id, actorEmail: user.email, action: "assessment.create", entity: "assessment_components", after: parsed.data });
    revalidatePath("/admin/academics/assessment");
    return null;
  });
}