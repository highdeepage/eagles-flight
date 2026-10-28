"use client";

import { useActionState, useEffect } from "react";
import { createSubject } from "@/lib/academics/actions";
import { Button, Input, Label, Select, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function SubjectsForm({ departments }: { departments: any[] }) {
  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(createSubject, null);
  const { push } = useToast();
  useEffect(() => {
    if (state?.ok) push("success", "Subject created.");
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push]);
  const err = (k: string) => (state && !state.ok ? state.error.fieldErrors?.[k] : undefined);

  return (
    <form action={action} className="space-y-3">
      {state && !state.ok && !state.error.fieldErrors && <Alert variant="error">{state.error.message}</Alert>}
      <div><Label htmlFor="name">Subject name</Label><Input id="name" name="name" required error={err("name")} /></div>
      <div><Label htmlFor="code">Code (2–6 letters)</Label><Input id="code" name="code" placeholder="MTH" required error={err("code")} /></div>
      <div>
        <Label htmlFor="department_id">Department</Label>
        <Select id="department_id" name="department_id">
          <option value="">—</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </div>
      <Button type="submit" loading={pending} className="w-full">Create subject</Button>
    </form>
  );
}