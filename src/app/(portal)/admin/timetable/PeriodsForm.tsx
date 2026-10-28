"use client";

import { useActionState, useEffect } from "react";
import { createPeriod } from "@/lib/timetable/actions";
import { Button, Input, Label, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function PeriodsForm() {
  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(createPeriod, null);
  const { push } = useToast();
  useEffect(() => {
    if (state?.ok) push("success", "Period created.");
    if (state && !state.ok) push("error", state.error.message);
  }, [state, push]);

  return (
    <form action={action} className="space-y-2">
      <div><Label>Label</Label><Input name="label" placeholder="Period 1 / Break" required /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Start</Label><Input name="start_time" type="time" required /></div>
        <div><Label>End</Label><Input name="end_time" type="time" required /></div>
      </div>
      <div><Label>Sort</Label><Input name="sort_order" type="number" defaultValue={0} /></div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_break" /> Break
      </label>
      <Button type="submit" size="sm" loading={pending} className="w-full">Add period</Button>
    </form>
  );
}