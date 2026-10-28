"use client";

import { useActionState, useEffect } from "react";
import { createComponent } from "@/lib/academics/actions";
import { Button, Input, Label, Select, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function AssessmentForm({ terms }: { terms: any[] }) {
  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(createComponent, null);
  const { push } = useToast();
  useEffect(() => {
    if (state?.ok) push("success", "Component created.");
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push]);

  return (
    <form action={action} className="space-y-3">
      {state && !state.ok && !state.error.fieldErrors && <Alert variant="error">{state.error.message}</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Term</Label>
          <Select name="term_id" required>
            <option value="">Choose…</option>
            {terms.map((t: any) => <option key={t.id} value={t.id}>{t.academic_sessions?.name} — {t.name}</option>)}
          </Select>
        </div>
        <div>
          <Label>Name</Label>
          <Input name="name" placeholder="CA" required />
        </div>
        <div>
          <Label>Weight %</Label>
          <Input name="weight" type="number" min={1} max={100} required />
        </div>
        <div>
          <Label>Sort</Label>
          <Input name="sort_order" type="number" defaultValue={0} />
        </div>
      </div>
      <Button type="submit" loading={pending} className="w-full">Add component</Button>
    </form>
  );
}