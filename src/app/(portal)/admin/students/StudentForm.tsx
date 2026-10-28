"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createStudent, updateStudent } from "@/lib/people/actions";
import { Button, Input, Label, Select, Alert, Card, CardBody, CardHeader, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

interface Props {
  genders: { item_key: string; item_label: string }[];
  initial?: any;
  mode?: "create" | "edit";
}

export function StudentForm({ genders, initial, mode = "create" }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const action = mode === "create"
    ? createStudent
    : updateStudent.bind(null, initial?.id);

  const [state, formAction, pending] = useActionState<ActionResult<any> | null, FormData>(action as any, null);

  useEffect(() => {
    if (state?.ok) {
      push("success", mode === "create" ? "Student created." : "Student updated.");
      router.push("/admin/students");
    }
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push, router, mode]);

  const err = (k: string) => (state && !state.ok ? state.error.fieldErrors?.[k] : undefined);
  const s = initial ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{mode === "create" ? "New student" : "Edit student"}</h1>
        <Button type="submit" loading={pending}>Save</Button>
      </div>

      {state && !state.ok && !state.error.fieldErrors && <Alert variant="error">{state.error.message}</Alert>}

      <Card>
        <CardHeader title="Identity" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div><Label>Admission no</Label><Input name="admission_no" defaultValue={s.admission_no ?? ""} required error={err("admission_no")} /></div>
          <div><Label>Status</Label>
            <Select name="status" defaultValue={s.status ?? "active"}>
              <option value="active">Active</option>
              <option value="graduated">Graduated</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="suspended">Suspended</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <div><Label>Surname</Label><Input name="surname" defaultValue={s.surname ?? ""} required error={err("surname")} /></div>
          <div><Label>First name</Label><Input name="first_name" defaultValue={s.first_name ?? ""} required error={err("first_name")} /></div>
          <div className="sm:col-span-2"><Label>Other names</Label><Input name="other_names" defaultValue={s.other_names ?? ""} /></div>
          <div><Label>Gender</Label>
            <Select name="gender" defaultValue={s.gender ?? ""} required error={err("gender")}>
              <option value="">Choose…</option>
              {genders.map((g) => <option key={g.item_key} value={g.item_key}>{g.item_label}</option>)}
            </Select>
          </div>
          <div><Label>Date of birth</Label><Input name="date_of_birth" type="date" defaultValue={s.date_of_birth ?? ""} /></div>
          <div className="sm:col-span-2">
            <Label>Passport photo</Label>
            <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
            <p className="mt-1 text-xs text-slate-500">Auto-resized and compressed. Max 3 MB upload.</p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Contact" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div><Label>Phone</Label><Input name="phone" defaultValue={s.phone ?? ""} /></div>
          <div><Label>Email</Label><Input name="email" type="email" defaultValue={s.email ?? ""} error={err("email")} /></div>
          <div className="sm:col-span-2"><Label>Address</Label><Input name="address" defaultValue={s.address ?? ""} /></div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Additional" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div><Label>State of origin</Label><Input name="state_of_origin" defaultValue={s.state_of_origin ?? ""} /></div>
          <div><Label>LGA</Label><Input name="lga" defaultValue={s.lga ?? ""} /></div>
          <div><Label>Nationality</Label><Input name="nationality" defaultValue={s.nationality ?? "Nigerian"} /></div>
          <div><Label>Religion</Label><Input name="religion" defaultValue={s.religion ?? ""} /></div>
          <div><Label>Blood group</Label><Input name="blood_group" defaultValue={s.blood_group ?? ""} /></div>
          <div><Label>Genotype</Label><Input name="genotype" defaultValue={s.genotype ?? ""} /></div>
          <div className="sm:col-span-2"><Label>Previous school</Label><Input name="previous_school" defaultValue={s.previous_school ?? ""} /></div>
          <div><Label>Admission date</Label><Input name="admission_date" type="date" defaultValue={s.admission_date ?? ""} /></div>
        </CardBody>
      </Card>
    </form>
  );
}