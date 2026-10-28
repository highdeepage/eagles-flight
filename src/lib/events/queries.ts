import "server-only";
import { createServerSupabase } from "@/lib/db/server";

export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  location: string | null;
  start_at: string;
  end_at: string | null;
  is_public: boolean;
  is_all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  item_key: string;
  item_label: string;
}

// ─── Admin: all events ─────────────────────────────────────
export async function listAllEvents(): Promise<EventRow[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("events")
    .select("*")
    .order("start_at", { ascending: false });
  return (data ?? []) as EventRow[];
}

export async function getEventById(id: string): Promise<EventRow | null> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as EventRow | null) ?? null;
}

// ─── Public: upcoming events ───────────────────────────────
export async function listUpcomingEvents(limit?: number): Promise<EventRow[]> {
  const s = await createServerSupabase();
  let q = s
    .from("events")
    .select("*")
    .eq("is_public", true)
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as EventRow[];
}

// ─── Public: past events ───────────────────────────────────
export async function listPastEvents(limit = 20): Promise<EventRow[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("events")
    .select("*")
    .eq("is_public", true)
    .lt("start_at", new Date().toISOString())
    .order("start_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as EventRow[];
}

// ─── Categories ────────────────────────────────────────────
export async function listEventTypes(): Promise<ListItem[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("system_lists")
    .select("item_key,item_label")
    .eq("list_key", "event_type")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as ListItem[];
}