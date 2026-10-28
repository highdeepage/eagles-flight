"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

// ─── Student: delete ───────────────────────────────────────
export async function deleteStudent(id: string): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const s = await createServerSupabase();

    // Guard: cannot delete a student with enrolments
    const { count } = await s
      .from("enrolments")
      .select("id", { count: "exact", head: true })
      .eq("student_id", id);

    if ((count ?? 0) > 0) {
      throw Errors.conflict(
        "This student has enrolments. Remove them from classes before deleting.",
      );
    }

    const { error } = await s.from("students").delete().eq("id", id);
    if (error) throw Errors.internal("Could not delete student.");

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "student.delete",
      entity: "students",
      entityId: id,
    });

    revalidatePath("/admin/students");
    return null;
  });
}

// ─── Staff: delete ─────────────────────────────────────────
export async function deleteStaff(id: string): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const s = await createServerSupabase();

    // Guard: cannot delete a staff member with teacher assignments
    const { count } = await s
      .from("teacher_assignments")
      .select("id", { count: "exact", head: true })
      .eq("staff_id", id);

    if ((count ?? 0) > 0) {
      throw Errors.conflict(
        "This staff member has teacher assignments. Remove them first.",
      );
    }

    const { error } = await s.from("staff").delete().eq("id", id);
    if (error) throw Errors.internal("Could not delete staff.");

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "staff.delete",
      entity: "staff",
      entityId: id,
    });

    revalidatePath("/admin/staff");
    return null;
  });
}

// ─── Parent: update ────────────────────────────────────────
const parentUpdateSchema = z.object({
  surname: z.string().min(1),
  first_name: z.string().min(1),
  other_names: z.string().optional(),
  relationship: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  occupation: z.string().optional(),
});

export async function updateParent(
  id: string,
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = parentUpdateSchema.safeParse(Object.fromEntries(formData));
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
    const { error } = await (s.from("parents") as any)
      .update({
        surname: d.surname,
        first_name: d.first_name,
        other_names: d.other_names || null,
        relationship: d.relationship || null,
        phone: d.phone || null,
        email: d.email || null,
        address: d.address || null,
        occupation: d.occupation || null,
      })
      .eq("id", id);
    if (error) throw Errors.internal("Could not update parent.");
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "parent.update",
      entity: "parents",
      entityId: id,
      after: d,
    });
    revalidatePath(`/admin/parents/${id}`);
    revalidatePath("/admin/parents");
    return null;
  });
}

// ─── Parent: delete ────────────────────────────────────────
export async function deleteParent(id: string): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const s = await createServerSupabase();
    const { error } = await s.from("parents").delete().eq("id", id);
    if (error) throw Errors.internal("Could not delete parent.");
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "parent.delete",
      entity: "parents",
      entityId: id,
    });
    revalidatePath("/admin/parents");
    return null;
  });
}

// ─── Class: update ─────────────────────────────────────────
const classSchema = z.object({
  name: z.string().min(1),
  level: z.coerce.number().int().optional(),
  description: z.string().optional(),
});

export async function updateClass(
  id: string,
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = classSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw Errors.validation("Check the form.");
    const s = await createServerSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (s.from("classes") as any)
      .update({
        name: parsed.data.name,
        level: parsed.data.level ?? null,
        description: parsed.data.description || null,
      })
      .eq("id", id);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("A class with that name exists.");
      throw Errors.internal("Could not update class.");
    }
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "class.update",
      entity: "classes",
      entityId: id,
      after: parsed.data,
    });
    revalidatePath("/admin/academics/classes");
    return null;
  });
}

// ─── Class: delete ─────────────────────────────────────────
export async function deleteClass(id: string): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const s = await createServerSupabase();

    // Guard: cannot delete if there are class arms with enrolled students
    const { data: arms } = await s.from("class_arms").select("id").eq("class_id", id);
    const armIds = (arms ?? []).map((a: any) => a.id);
    if (armIds.length > 0) {
      const { count } = await s
        .from("enrolments")
        .select("id", { count: "exact", head: true })
        .in("class_arm_id", armIds);
      if ((count ?? 0) > 0) {
        throw Errors.conflict(
          "This class has students enrolled. Withdraw them first.",
        );
      }
    }

    const { error } = await s.from("classes").delete().eq("id", id);
    if (error) throw Errors.internal("Could not delete class.");
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "class.delete",
      entity: "classes",
      entityId: id,
    });
    revalidatePath("/admin/academics/classes");
    return null;
  });
}

// ─── Class arm: update ─────────────────────────────────────
const armSchema = z.object({
  arm_name: z.string().min(1),
  class_teacher_id: z.string().uuid().optional().or(z.literal("")),
});

export async function updateArm(
  id: string,
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = armSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw Errors.validation("Check the form.");
    const s = await createServerSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (s.from("class_arms") as any)
      .update({
        arm_name: parsed.data.arm_name,
        class_teacher_id: parsed.data.class_teacher_id || null,
      })
      .eq("id", id);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("That arm exists in this class.");
      throw Errors.internal("Could not update arm.");
    }
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "arm.update",
      entity: "class_arms",
      entityId: id,
      after: parsed.data,
    });
    revalidatePath("/admin/academics/arms");
    return null;
  });
}

export async function deleteArm(id: string): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const s = await createServerSupabase();
    const { count } = await s
      .from("enrolments")
      .select("id", { count: "exact", head: true })
      .eq("class_arm_id", id);
    if ((count ?? 0) > 0) {
      throw Errors.conflict("This arm has students enrolled. Withdraw them first.");
    }
    const { error } = await s.from("class_arms").delete().eq("id", id);
    if (error) throw Errors.internal("Could not delete arm.");
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "arm.delete",
      entity: "class_arms",
      entityId: id,
    });
    revalidatePath("/admin/academics/arms");
    return null;
  });
}

// ─── Subject: update ───────────────────────────────────────
const subjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).regex(/^[A-Z0-9]{2,6}$/),
  department_id: z.string().uuid().optional().or(z.literal("")),
});

export async function updateSubject(
  id: string,
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = subjectSchema.safeParse(Object.fromEntries(formData));
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
    const { error } = await (s.from("subjects") as any)
      .update({
        name: parsed.data.name,
        code: parsed.data.code,
        department_id: parsed.data.department_id || null,
      })
      .eq("id", id);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("A subject with that code exists.");
      throw Errors.internal("Could not update subject.");
    }
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "subject.update",
      entity: "subjects",
      entityId: id,
      after: parsed.data,
    });
    revalidatePath("/admin/academics/subjects");
    return null;
  });
}

export async function deleteSubject(id: string): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const s = await createServerSupabase();
    const { count } = await s
      .from("teacher_assignments")
      .select("id", { count: "exact", head: true })
      .eq("subject_id", id);
    if ((count ?? 0) > 0) {
      throw Errors.conflict("This subject has teacher assignments. Remove them first.");
    }
    const { error } = await s.from("subjects").delete().eq("id", id);
    if (error) throw Errors.internal("Could not delete subject.");
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "subject.delete",
      entity: "subjects",
      entityId: id,
    });
    revalidatePath("/admin/academics/subjects");
    return null;
  });
}

// ─── Department: update ────────────────────────────────────
const deptSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function updateDepartment(
  id: string,
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = deptSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw Errors.validation("Check the form.");
    const s = await createServerSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (s.from("departments") as any)
      .update({
        name: parsed.data.name,
        description: parsed.data.description || null,
      })
      .eq("id", id);
    if (error) {
      if (error.code === "23505") throw Errors.conflict("A department with that name exists.");
      throw Errors.internal("Could not update department.");
    }
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "department.update",
      entity: "departments",
      entityId: id,
      after: parsed.data,
    });
    revalidatePath("/admin/academics/departments");
    return null;
  });
}

export async function deleteDepartment(id: string): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const s = await createServerSupabase();
    const { error } = await s.from("departments").delete().eq("id", id);
    if (error) throw Errors.internal("Could not delete department.");
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "department.delete",
      entity: "departments",
      entityId: id,
    });
    revalidatePath("/admin/academics/departments");
    return null;
  });
}