"use client";

import { useActionState, useEffect } from "react";
import { createAssignment } from "@/lib/academics/actions";
import { Button, Label, Select, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function AssignmentsForm({
  teachers, subjects, arms, terms,
}: {
  teachers: any[]; subjects: any[]; arms: any[]; terms: any[];
}) {
  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(createAssignment, null);
  const { push } = useToast();
  useEffect(() => {
    if (state?.ok) push("success", "Assignment created.");
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push]);

  return (
    <form action={action} className="space-y-3">
      {state && !state.ok && !state.error.fieldErrors && <Alert variant="error">{state.error.message}</Alert>}
      <div>
        <Label>Teacher</Label>
        <Select name="staff_id" required>
          <option value="">Choose…</option>
          {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name ?? t.email}</option>)}
        </Select>
      </div>
      <div>
        <Label>Subject</Label>
        <Select name="subject_id" required>
          <option value="">Choose…</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
        </Select>
      </div>
      <div>
        <Label>Class arm</Label>
        <Select name="class_arm_id" required>
          <option value="">Choose…</option>
          {arms.map((a: any) => <option key={a.id} value={a.id}>{a.classes?.name} — {a.arm_name}</option>)}
        </Select>
      </div>
      <div>
        <Label>Term</Label>
        <Select name="term_id" required>
          <option value="">Choose…</option>
          {terms.map((t: any) => <option key={t.id} value={t.id}>{t.academic_sessions?.name} — {t.name}</option>)}
        </Select>
      </div>
      <Button type="submit" loading={pending} className="w-full">Create assignment</Button>
    </form>
  );
}