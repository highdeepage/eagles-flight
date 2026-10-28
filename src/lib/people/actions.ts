"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";
import { processAndStorePassport } from "./photo";
import { listPassportSettings } from "./queries";

// ─── Students ───────────────────────────────────────────────
const studentSchema = z.object({
  admission_no: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9\-\/]+$/, "Letters, digits, dash or slash."),
  surname: z.string().min(1),
  first_name: z.string().min(1),
  other_names: z.string().optional(),
  gender: z.string().min(1),
  date_of_birth: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  state_of_origin: z.string().optional(),
  lga: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  blood_group: z.string().optional(),
  genotype: z.string().optional(),
  previous_school: z.string().optional(),
  admission_date: z.string().optional(),
  status: z.string().default("active"),
});

export async function createStudent(
  _: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const raw = Object.fromEntries(formData);
    console.log("[createStudent] incoming:", raw);

    const parsed = studentSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[createStudent] zod error:", parsed.error.issues);
      throw Errors.validation(
        "Check the form.",
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path[0] as string, i.message]),
        ),
      );
    }
    const d = parsed.data;
    const s = await createServerSupabase();

    let photo_path: string | null = null;
    const photoFile = formData.get("photo") as File | null;
    if (photoFile && photoFile.size > 0) {
      try {
        const settings = await listPassportSettings();
        photo_path = await processAndStorePassport(photoFile, "students", {
          width: settings.width,
          height: settings.height,
          maxKb: settings.max_kb,
        });
      } catch (e: any) {
        console.error("[createStudent] photo error:", e);
        throw Errors.validation(e?.message ?? "Photo upload failed.");
      }
    }

    const payload = {
      admission_no: d.admission_no.trim(),
      surname: d.surname.trim(),
      first_name: d.first_name.trim(),
      other_names: d.other_names?.trim() || null,
      gender: d.gender,
      date_of_birth: d.date_of_birth || null,
      photo_path,
      phone: d.phone?.trim() || null,
      email: d.email?.trim() || null,
      address: d.address?.trim() || null,
      state_of_origin: d.state_of_origin?.trim() || null,
      lga: d.lga?.trim() || null,
      nationality: d.nationality?.trim() || "Nigerian",
      religion: d.religion?.trim() || null,
      blood_group: d.blood_group?.trim() || null,
      genotype: d.genotype?.trim() || null,
      previous_school: d.previous_school?.trim() || null,
      admission_date: d.admission_date || null,
      status: d.status,
    };

    console.log("[createStudent] payload:", payload);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (s.from("students") as any)
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("[createStudent] supabase error:", error);
      if (error.code === "23505")
        throw Errors.conflict("That admission number is already in use.");
      if (error.code === "42501" || error.code === "PGRST301")
        throw Errors.forbidden("You do not have permission. Confirm your role is admin.");
      throw Errors.internal(
        `Could not save student: ${error.message ?? "Unknown database error"}`,
      );
    }

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "student.create",
      entity: "students",
      entityId: data.id,
      after: payload,
    });

    revalidatePath("/admin/students");
    return { id: data.id };
  });
}

export async function updateStudent(
  id: string,
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const raw = Object.fromEntries(formData);
    const parsed = studentSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[updateStudent] zod error:", parsed.error.issues);
      throw Errors.validation(
        "Check the form.",
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path[0] as string, i.message]),
        ),
      );
    }
    const d = parsed.data;
    const s = await createServerSupabase();

    let photo_path: string | undefined;
    const photoFile = formData.get("photo") as File | null;
    if (photoFile && photoFile.size > 0) {
      try {
        const settings = await listPassportSettings();
        photo_path = await processAndStorePassport(photoFile, "students", {
          width: settings.width,
          height: settings.height,
          maxKb: settings.max_kb,
        });
      } catch (e: any) {
        throw Errors.validation(e?.message ?? "Photo upload failed.");
      }
    }

    const patch: Record<string, unknown> = {
      admission_no: d.admission_no.trim(),
      surname: d.surname.trim(),
      first_name: d.first_name.trim(),
      other_names: d.other_names?.trim() || null,
      gender: d.gender,
      date_of_birth: d.date_of_birth || null,
      phone: d.phone?.trim() || null,
      email: d.email?.trim() || null,
      address: d.address?.trim() || null,
      state_of_origin: d.state_of_origin?.trim() || null,
      lga: d.lga?.trim() || null,
      nationality: d.nationality?.trim() || "Nigerian",
      religion: d.religion?.trim() || null,
      blood_group: d.blood_group?.trim() || null,
      genotype: d.genotype?.trim() || null,
      previous_school: d.previous_school?.trim() || null,
      admission_date: d.admission_date || null,
      status: d.status,
    };
    if (photo_path) patch.photo_path = photo_path;

    const { data: before } = await s.from("students").select("*").eq("id", id).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (s.from("students") as any).update(patch).eq("id", id);
    if (error) {
      console.error("[updateStudent] supabase error:", error);
      if (error.code === "23505")
        throw Errors.conflict("That admission number is already in use.");
      if (error.code === "42501" || error.code === "PGRST301")
        throw Errors.forbidden("You do not have permission.");
      throw Errors.internal(
        `Could not update student: ${error.message ?? "Unknown database error"}`,
      );
    }

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "student.update",
      entity: "students",
      entityId: id,
      before,
      after: patch,
    });

    revalidatePath(`/admin/students/${id}`);
    revalidatePath("/admin/students");
    return null;
  });
}

// ─── Staff ──────────────────────────────────────────────────
const staffSchema = z.object({
  staff_no: z.string().min(1),
  surname: z.string().min(1),
  first_name: z.string().min(1),
  other_names: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  department_id: z.string().uuid().optional().or(z.literal("")),
  designation: z.string().optional(),
  qualifications: z.string().optional(),
  employment_status: z.string().default("active"),
  employment_date: z.string().optional(),
});

export async function createStaff(
  _: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const raw = Object.fromEntries(formData);
    console.log("[createStaff] incoming:", raw);

    const parsed = staffSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[createStaff] zod error:", parsed.error.issues);
      throw Errors.validation(
        "Check the form.",
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path[0] as string, i.message]),
        ),
      );
    }
    const d = parsed.data;
    const s = await createServerSupabase();

    let photo_path: string | null = null;
    const photoFile = formData.get("photo") as File | null;
    if (photoFile && photoFile.size > 0) {
      try {
        const settings = await listPassportSettings();
        photo_path = await processAndStorePassport(photoFile, "staff", {
          width: settings.width,
          height: settings.height,
          maxKb: settings.max_kb,
        });
      } catch (e: any) {
        console.error("[createStaff] photo error:", e);
        throw Errors.validation(e?.message ?? "Photo upload failed.");
      }
    }

    const payload = {
      staff_no: d.staff_no.trim(),
      surname: d.surname.trim(),
      first_name: d.first_name.trim(),
      other_names: d.other_names?.trim() || null,
      gender: d.gender || null,
      date_of_birth: d.date_of_birth || null,
      photo_path,
      phone: d.phone?.trim() || null,
      email: d.email?.trim() || null,
      address: d.address?.trim() || null,
      department_id: d.department_id || null,
      designation: d.designation?.trim() || null,
      qualifications: d.qualifications?.trim() || null,
      employment_status: d.employment_status,
      employment_date: d.employment_date || null,
    };

    console.log("[createStaff] payload:", payload);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (s.from("staff") as any)
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("[createStaff] supabase error:", error);
      if (error.code === "23505")
        throw Errors.conflict("That staff number is already in use.");
      if (error.code === "42501" || error.code === "PGRST301")
        throw Errors.forbidden("You do not have permission.");
      throw Errors.internal(
        `Could not save staff: ${error.message ?? "Unknown database error"}`,
      );
    }

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "staff.create",
      entity: "staff",
      entityId: data.id,
      after: payload,
    });

    revalidatePath("/admin/staff");
    return { id: data.id };
  });
}

export async function updateStaff(
  id: string,
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = staffSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      console.error("[updateStaff] zod error:", parsed.error.issues);
      throw Errors.validation(
        "Check the form.",
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path[0] as string, i.message]),
        ),
      );
    }
    const d = parsed.data;
    const s = await createServerSupabase();

    let photo_path: string | undefined;
    const photoFile = formData.get("photo") as File | null;
    if (photoFile && photoFile.size > 0) {
      try {
        const settings = await listPassportSettings();
        photo_path = await processAndStorePassport(photoFile, "staff", {
          width: settings.width,
          height: settings.height,
          maxKb: settings.max_kb,
        });
      } catch (e: any) {
        throw Errors.validation(e?.message ?? "Photo upload failed.");
      }
    }

    const patch: Record<string, unknown> = {
      staff_no: d.staff_no.trim(),
      surname: d.surname.trim(),
      first_name: d.first_name.trim(),
      other_names: d.other_names?.trim() || null,
      gender: d.gender || null,
      date_of_birth: d.date_of_birth || null,
      phone: d.phone?.trim() || null,
      email: d.email?.trim() || null,
      address: d.address?.trim() || null,
      department_id: d.department_id || null,
      designation: d.designation?.trim() || null,
      qualifications: d.qualifications?.trim() || null,
      employment_status: d.employment_status,
      employment_date: d.employment_date || null,
    };
    if (photo_path) patch.photo_path = photo_path;

    const { data: before } = await s.from("staff").select("*").eq("id", id).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (s.from("staff") as any).update(patch).eq("id", id);
    if (error) {
      console.error("[updateStaff] supabase error:", error);
      if (error.code === "23505")
        throw Errors.conflict("That staff number is already in use.");
      if (error.code === "42501" || error.code === "PGRST301")
        throw Errors.forbidden("You do not have permission.");
      throw Errors.internal(
        `Could not update staff: ${error.message ?? "Unknown database error"}`,
      );
    }

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "staff.update",
      entity: "staff",
      entityId: id,
      before,
      after: patch,
    });

    revalidatePath(`/admin/staff/${id}`);
    revalidatePath("/admin/staff");
    return null;
  });
}

// ─── Parents ────────────────────────────────────────────────
const parentSchema = z.object({
  surname: z.string().min(1),
  first_name: z.string().min(1),
  other_names: z.string().optional(),
  relationship: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  occupation: z.string().optional(),
});

export async function createParent(
  _: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = parentSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      console.error("[createParent] zod error:", parsed.error.issues);
      throw Errors.validation(
        "Check the form.",
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path[0] as string, i.message]),
        ),
      );
    }
    const d = parsed.data;
    const s = await createServerSupabase();
    const payload = {
      surname: d.surname.trim(),
      first_name: d.first_name.trim(),
      other_names: d.other_names?.trim() || null,
      relationship: d.relationship || null,
      phone: d.phone?.trim() || null,
      email: d.email?.trim() || null,
      address: d.address?.trim() || null,
      occupation: d.occupation?.trim() || null,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (s.from("parents") as any)
      .insert(payload)
      .select("id")
      .single();
    if (error) {
      console.error("[createParent] supabase error:", error);
      if (error.code === "42501")
        throw Errors.forbidden("You do not have permission.");
      throw Errors.internal(
        `Could not save parent: ${error.message ?? "Unknown database error"}`,
      );
    }
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "parent.create",
      entity: "parents",
      entityId: data.id,
      after: payload,
    });
    revalidatePath("/admin/parents");
    return { id: data.id };
  });
}

export async function linkParentToStudent(
  parentId: string,
  studentId: string,
  relationship: string,
  isPrimary: boolean,
): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (s.from("parent_student") as any).insert({
    parent_id: parentId,
    student_id: studentId,
    relationship,
    is_primary: isPrimary,
  });
  if (error) {
    if (error.code === "23505") throw Errors.conflict("That link already exists.");
    throw Errors.internal("Could not link.");
  }
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "parent.link",
    entity: "parent_student",
    after: { parentId, studentId, relationship, isPrimary },
  });
  revalidatePath(`/admin/parents/${parentId}`);
}

// ─── Signed photo URL ──────────────────────────────────────
export async function getPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const s = await createServerSupabase();
  const { data } = await s.storage.from("passports").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}