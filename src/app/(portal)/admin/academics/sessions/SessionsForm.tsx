"use client";

import { useActionState, useEffect } from "react";
import { createSession } from "@/lib/academics/actions";
import { Button, Input, Label, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function SessionsForm() {
  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(createSession, null);
  const { push } = useToast();
  useEffect(() => {
    if (state?.ok) push("success", "Session created.");
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push]);

  const err = (k: string) => (state && !state.ok ? state.error.fieldErrors?.[k] : undefined);

  return (
    <form action={action} className="space-y-3">
      {state && !state.ok && !state.error.fieldErrors && <Alert variant="error">{state.error.message}</Alert>}
      <div><Label htmlFor="name">Name (e.g. 2025/2026)</Label><Input id="name" name="name" required error={err("name")} /></div>
      <div><Label htmlFor="start_date">Start date</Label><Input id="start_date" name="start_date" type="date" required error={err("start_date")} /></div>
      <div><Label htmlFor="end_date">End date</Label><Input id="end_date" name="end_date" type="date" required error={err("end_date")} /></div>
      <Button type="submit" loading={pending} className="w-full">Create session</Button>
    </form>
  );
}