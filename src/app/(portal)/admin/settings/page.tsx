import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { LogoUploader } from "./LogoUploader";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "School Settings — Eagles Flight" };

export default async function SettingsPage() {
  await requireAdmin();

  const supabase = await createServerSupabase();
  const { data: settings } = await supabase
    .from("school_settings")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">School Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Everything below is stored in the database and used across the public site and portal.
        </p>
      </div>

      <Card>
        <CardHeader
          title="School logo"
          description="Displayed on the public website header. PNG, JPEG, WebP or SVG, under 1.5 MB."
        />
        <CardBody>
          <LogoUploader currentUrl={settings?.logo_url ?? null} />
        </CardBody>
      </Card>

      <SettingsForm initial={settings} />
    </div>
  );
}