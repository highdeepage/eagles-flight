"use client";

import { useActionState, useEffect } from "react";
import { createArm } from "@/lib/academics/actions";
import { Button, Input, Label, Select, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function ArmsForm({ classes, teachers }: { classes: any[]; teachers: any[] }) {
  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(createArm, null);
  const { push } = useToast();
  useEffect(() => {
    if (state?.ok) push("success", "Arm created.");
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push]);

  return (
    <form action={action} className="space-y-3">
      {state && !state.ok && !state.error.fieldErrors && <Alert variant="error">{state.error.message}</Alert>}
      <div>
        <Label htmlFor="class_id">Class</Label>
        <Select id="class_id" name="class_id" required>
          <option value="">Choose…</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>
      <div><Label htmlFor="arm_name">Arm name</Label><Input id="arm_name" name="arm_name" placeholder="A, B, Gold…" required /></div>
      <div>
        <Label htmlFor="class_teacher_id">Class teacher (optional)</Label>
        <Select id="class_teacher_id" name="class_teacher_id">
          <option value="">—</option>
          {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name ?? t.email}</option>)}
        </Select>
      </div>
      <Button type="submit" loading={pending} className="w-full">Create arm</Button>
    </form>
  );
}