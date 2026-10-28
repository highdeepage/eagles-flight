"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { safeAction, type ActionResult } from "@/lib/errors/handle";
import { Errors } from "@/lib/errors/AppError";
import { logAudit } from "@/lib/audit";

const addSchema = z.object({
  list_key: z.string().min(1),
  item_key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and underscores only."),
  item_label: z.string().min(1),
  sort_order: z.coerce.number().int().default(0),
});

export async function addListItem(
  _prev: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  return safeAction(async () => {
    const user = await requireAdmin();
    const parsed = addSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw Errors.validation(
        "Please correct the highlighted fields.",
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path[0] as string, i.message]),
        ),
      );
    }

    const payload = {
      list_key: parsed.data.list_key,
      item_key: parsed.data.item_key,
      item_label: parsed.data.item_label,
      sort_order: parsed.data.sort_order,
      is_system: false,
    };

    const supabase = await createServerSupabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("system_lists") as any).insert(payload);

    if (error) {
      if (error.code === "23505")
        throw Errors.conflict("That item already exists in this list.");
      throw Errors.internal("Could not add item.");
    }

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "system_list.add",
      entity: "system_lists",
      after: payload,
    });

    revalidatePath("/admin/lists");
    return null;
  });
}

export async function toggleListItem(
  id: string,
  isActive: boolean,
): Promise<void> {
  const user = await requireAdmin();
  const supabase = await createServerSupabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("system_lists") as any)
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw Errors.internal("Could not update item.");

  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: isActive ? "system_list.activate" : "system_list.deactivate",
    entity: "system_lists",
    entityId: id,
  });

  revalidatePath("/admin/lists");
}