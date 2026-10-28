import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { SystemListsManager } from "./SystemListsManager";

export const metadata = { title: "System Lists — Eagles Flight" };

export default async function ListsPage() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("system_lists").select("*").order("list_key").order("sort_order");

  const grouped: Record<string, any[]> = {};
  for (const row of data ?? []) (grouped[row.list_key] ??= []).push(row);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Lists</h1>
        <p className="mt-1 text-sm text-slate-500">
          These drive every dropdown, category and status across the app. Adding an item here makes it available everywhere — no code changes needed.
        </p>
      </div>
      <SystemListsManager grouped={grouped} />
    </div>
  );
}