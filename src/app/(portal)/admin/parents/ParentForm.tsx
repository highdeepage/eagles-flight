"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createParent } from "@/lib/people/actions";
import { Button, Input, Label, Select, Alert, Card, CardBody, CardHeader, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

interface Props {
  relationships: { item_key: string; item_label: string }[];
  initial?: any;
}

export function ParentForm({ relationships, initial }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [state, action, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(createParent, null);

  useEffect(() => {
    if (state?.ok) {
      push("success", "Parent created.");
      router.push(`/admin/parents/${state.data.id}`);
    }
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push, router]);

  const s = initial ?? {};

  return (
    <form action={action} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New parent</h1>
        <Button type="submit" loading={pending}>Save</Button>
      </div>
      {state && !state.ok && !state.error.fieldErrors && <Alert variant="error">{state.error.message}</Alert>}

      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div><Label>Surname</Label><Input name="surname" defaultValue={s.surname ?? ""} required /></div>
          <div><Label>First name</Label><Input name="first_name" defaultValue={s.first_name ?? ""} required /></div>
          <div className="sm:col-span-2"><Label>Other names</Label><Input name="other_names" defaultValue={s.other_names ?? ""} /></div>
          <div>
            <Label>Relationship</Label>
            <Select name="relationship" defaultValue={s.relationship ?? ""}>
              <option value="">—</option>
              {relationships.map((r) => <option key={r.item_key} value={r.item_key}>{r.item_label}</option>)}
            </Select>
          </div>
          <div><Label>Occupation</Label><Input name="occupation" defaultValue={s.occupation ?? ""} /></div>
          <div><Label>Phone</Label><Input name="phone" defaultValue={s.phone ?? ""} /></div>
          <div><Label>Email</Label><Input name="email" type="email" defaultValue={s.email ?? ""} /></div>
          <div className="sm:col-span-2"><Label>Address</Label><Input name="address" defaultValue={s.address ?? ""} /></div>
        </CardBody>
      </Card>
    </form>
  );
}