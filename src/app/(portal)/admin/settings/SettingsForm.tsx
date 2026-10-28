"use client";

import { useActionState, useEffect } from "react";
import { updateSettings } from "./actions";
import {
  Button, Input, Label, Card, CardBody, CardHeader, Alert, useToast,
} from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

interface Props {
  initial: any;
}

export function SettingsForm({ initial }: Props) {
  const { push } = useToast();
  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(updateSettings, null);

  useEffect(() => {
    if (state?.ok) push("success", "Settings saved.");
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push]);

  const err = (k: string) => (state && !state.ok ? state.error.fieldErrors?.[k] : undefined);
  const s = initial ?? {};

  return (
    <form action={action} className="space-y-6">
      {state && !state.ok && !state.error.fieldErrors && (
        <Alert variant="error">{state.error.message}</Alert>
      )}
      {state?.ok && <Alert variant="success">Settings saved.</Alert>}

      <Card>
        <CardHeader title="Branding" description="Shown across the public site and portal" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="school_name">School name</Label>
            <Input id="school_name" name="school_name" defaultValue={s.school_name ?? ""} error={err("school_name")} />
          </div>
          <div>
            <Label htmlFor="short_name">Short name</Label>
            <Input id="short_name" name="short_name" defaultValue={s.short_name ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="motto">Motto</Label>
            <Input id="motto" name="motto" defaultValue={s.motto ?? ""} />
          </div>
          <div>
            <Label htmlFor="brand_primary">Primary colour</Label>
            <Input id="brand_primary" name="brand_primary" type="color" defaultValue={s.brand_colors?.primary ?? "#1e3a8a"} error={err("brand_primary")} />
          </div>
          <div>
            <Label htmlFor="brand_accent">Accent colour</Label>
            <Input id="brand_accent" name="brand_accent" type="color" defaultValue={s.brand_colors?.accent ?? "#f59e0b"} error={err("brand_accent")} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Contact" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={s.address ?? ""} />
          </div>
          <div>
            <Label htmlFor="phone_primary">Phone</Label>
            <Input id="phone_primary" name="phone_primary" defaultValue={s.phone_primary ?? ""} />
          </div>
          <div>
            <Label htmlFor="phone_secondary">Alternate phone</Label>
            <Input id="phone_secondary" name="phone_secondary" defaultValue={s.phone_secondary ?? ""} />
          </div>
          <div>
            <Label htmlFor="email_primary">Email</Label>
            <Input id="email_primary" name="email_primary" type="email" defaultValue={s.email_primary ?? ""} error={err("email_primary")} />
          </div>
          <div>
            <Label htmlFor="email_admissions">Admissions email</Label>
            <Input id="email_admissions" name="email_admissions" type="email" defaultValue={s.email_admissions ?? ""} error={err("email_admissions")} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" defaultValue={s.website ?? ""} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="About the school" />
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="history">History</Label>
            <textarea id="history" name="history" rows={3} defaultValue={s.history ?? ""} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <Label htmlFor="vision">Vision</Label>
            <textarea id="vision" name="vision" rows={3} defaultValue={s.vision ?? ""} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <Label htmlFor="mission">Mission</Label>
            <textarea id="mission" name="mission" rows={3} defaultValue={s.mission ?? ""} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <Label htmlFor="principal_name">Principal name</Label>
            <Input id="principal_name" name="principal_name" defaultValue={s.principal_name ?? ""} />
          </div>
          <div>
            <Label htmlFor="principal_message">Principal message</Label>
            <textarea id="principal_message" name="principal_message" rows={4} defaultValue={s.principal_message ?? ""} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <Label htmlFor="footer_text">Footer text</Label>
            <Input id="footer_text" name="footer_text" defaultValue={s.footer_text ?? ""} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Passport photo settings" description="Used when processing student/staff photos" />
        <CardBody className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="passport_width">Width (px)</Label>
            <Input id="passport_width" name="passport_width" type="number" defaultValue={s.passport_photo?.width ?? 400} />
          </div>
          <div>
            <Label htmlFor="passport_height">Height (px)</Label>
            <Input id="passport_height" name="passport_height" type="number" defaultValue={s.passport_photo?.height ?? 500} />
          </div>
          <div>
            <Label htmlFor="passport_max_kb">Max KB</Label>
            <Input id="passport_max_kb" name="passport_max_kb" type="number" defaultValue={s.passport_photo?.max_kb ?? 200} />
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={pending}>Save settings</Button>
      </div>
    </form>
  );
}