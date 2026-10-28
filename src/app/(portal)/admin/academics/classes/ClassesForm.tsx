"use client";

import { useActionState, useEffect } from "react";
import { createClass } from "@/lib/academics/actions";
import { Button, Input, Label, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function ClassesForm() {
  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(createClass, null);
  const { push } = useToast();
  useEffect(() => {
    if (state?.ok) push("success", "Class created.");
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push]);

  return (
    <form action={action} className="space-y-3">
      {state && !state.ok && !state.error.fieldErrors && <Alert variant="error">{state.error.message}</Alert>}
      <div><Label htmlFor="name">Name (e.g. SSS 1)</Label><Input id="name" name="name" required /></div>
      <div><Label htmlFor="level">Level (numeric)</Label><Input id="level" name="level" type="number" /></div>
      <div><Label htmlFor="description">Description</Label><Input id="description" name="description" /></div>
      <Button type="submit" loading={pending} className="w-full">Create class</Button>
    </form>
  );
}