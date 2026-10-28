"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  event_type: z.string().optional(),
  location: z.string().optional(),
  start_at: z.string().min(1, "Start date is required."),
  end_at: z.string().optional(),
  is_public: z.coerce.boolean().default(true),
  is_all_day: z.coerce.boolean().default(false),
});

export async function createEvent(
  _: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = eventSchema.safeParse({
      ...Object.fromEntries(formData),
      is_public: formData.get("is_public") === "on",
      is_all_day: formData.get("is_all_day") === "on",
    });
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
    const { data, error } = await (s.from("events") as any)
      .insert({
        title: d.title,
        description: d.description || null,
        event_type: d.event_type || null,
        location: d.location || null,
        start_at: d.start_at,
        end_at: d.end_at || null,
        is_public: d.is_public,
        is_all_day: d.is_all_day,
      })
      .select("id")
      .single();

    if (error) throw Errors.internal("Could not create event.");

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "event.create",
      entity: "events",
      entityId: data.id,
      after: d,
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/");
    return data as { id: string };
  });
}

export async function updateEvent(
  id: string,
  _: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = eventSchema.safeParse({
      ...Object.fromEntries(formData),
      is_public: formData.get("is_public") === "on",
      is_all_day: formData.get("is_all_day") === "on",
    });
    if (!parsed.success) throw Errors.validation("Check the form.");
    const d = parsed.data;

    const s = await createServerSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (s.from("events") as any)
      .update({
        title: d.title,
        description: d.description || null,
        event_type: d.event_type || null,
        location: d.location || null,
        start_at: d.start_at,
        end_at: d.end_at || null,
        is_public: d.is_public,
        is_all_day: d.is_all_day,
      })
      .eq("id", id);

    if (error) throw Errors.internal("Could not update event.");

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "event.update",
      entity: "events",
      entityId: id,
      after: d,
    });

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}`);
    revalidatePath("/events");
    revalidatePath("/");
    return null;
  });
}

export async function deleteEvent(id: string): Promise<void> {
  const user = await requireAdmin();
  const s = await createServerSupabase();
  const { error } = await s.from("events").delete().eq("id", id);
  if (error) throw Errors.internal("Could not delete event.");
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "event.delete",
    entity: "events",
    entityId: id,
  });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}