"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createStaff } from "@/lib/people/actions";
import { Button, Input, Label, Select, Alert, Card, CardBody, CardHeader, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

interface Props {
  departments: { id: string; name: string }[];
  genders: { item_key: string; item_label: string }[];
  initial?: any;
  mode?: "create" | "edit";
}

export function StaffForm({ departments, genders, initial, mode = "create" }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [state, action, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(createStaff, null);

  useEffect(() => {
    if (state?.ok) { push("success", "Staff created."); router.push("/admin/staff"); }
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push, router]);

  const err = (k: string) => (state && !state.ok ? state.error.fieldErrors?.[k] : undefined);
  const s = initial ?? {};

  return (
    <form action={action} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{mode === "create" ? "New staff" : "Edit staff"}</h1>
        <Button type="submit" loading={pending}>Save</Button>
      </div>
      {state && !state.ok && !state.error.fieldErrors && <Alert variant="error">{state.error.message}</Alert>}

      <Card>
        <CardHeader title="Identity" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div><Label>Staff no</Label><Input name="staff_no" defaultValue={s.staff_no ?? ""} required error={err("staff_no")} /></div>
          <div><Label>Employment status</Label>
            <Select name="employment_status" defaultValue={s.employment_status ?? "active"}>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="suspended">Suspended</option>
              <option value="resigned">Resigned</option>
            </Select>
          </div>
          <div><Label>Surname</Label><Input name="surname" defaultValue={s.surname ?? ""} required /></div>
          <div><Label>First name</Label><Input name="first_name" defaultValue={s.first_name ?? ""} required /></div>
          <div className="sm:col-span-2"><Label>Other names</Label><Input name="other_names" defaultValue={s.other_names ?? ""} /></div>
          <div><Label>Gender</Label>
            <Select name="gender" defaultValue={s.gender ?? ""}>
              <option value="">—</option>
              {genders.map((g) => <option key={g.item_key} value={g.item_key}>{g.item_label}</option>)}
            </Select>
          </div>
          <div><Label>Date of birth</Label><Input name="date_of_birth" type="date" defaultValue={s.date_of_birth ?? ""} /></div>
          <div className="sm:col-span-2">
            <Label>Passport photo</Label>
            <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Contact & assignment" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div><Label>Phone</Label><Input name="phone" defaultValue={s.phone ?? ""} /></div>
          <div><Label>Email</Label><Input name="email" type="email" defaultValue={s.email ?? ""} error={err("email")} /></div>
          <div className="sm:col-span-2"><Label>Address</Label><Input name="address" defaultValue={s.address ?? ""} /></div>
          <div><Label>Department</Label>
            <Select name="department_id" defaultValue={s.department_id ?? ""}>
              <option value="">—</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div><Label>Designation</Label><Input name="designation" defaultValue={s.designation ?? ""} /></div>
          <div className="sm:col-span-2"><Label>Qualifications</Label><Input name="qualifications" defaultValue={s.qualifications ?? ""} /></div>
          <div><Label>Employment date</Label><Input name="employment_date" type="date" defaultValue={s.employment_date ?? ""} /></div>
        </CardBody>
      </Card>
    </form>
  );
}