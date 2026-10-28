"use client";

import { useActionState, useEffect } from "react";
import { createTerm } from "@/lib/academics/actions";
import { Button, Input, Label, Select, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function TermsForm({ sessions }: { sessions: any[] }) {
  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(createTerm, null);
  const { push } = useToast();
  useEffect(() => {
    if (state?.ok) push("success", "Term created.");
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push]);
  const err = (k: string) => (state && !state.ok ? state.error.fieldErrors?.[k] : undefined);

  return (
    <form action={action} className="space-y-3">
      {state && !state.ok && !state.error.fieldErrors && <Alert variant="error">{state.error.message}</Alert>}
      <div>
        <Label htmlFor="session_id">Session</Label>
        <Select id="session_id" name="session_id" required>
          <option value="">Choose…</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>
      <div><Label htmlFor="name">Name (e.g. Term 1)</Label><Input id="name" name="name" required error={err("name")} /></div>
      <div><Label htmlFor="start_date">Start date</Label><Input id="start_date" name="start_date" type="date" /></div>
      <div><Label htmlFor="end_date">End date</Label><Input id="end_date" name="end_date" type="date" /></div>
      <div><Label htmlFor="sort_order">Sort order</Label><Input id="sort_order" name="sort_order" type="number" defaultValue={0} /></div>
      <Button type="submit" loading={pending} className="w-full">Create term</Button>
    </form>
  );
}