import "server-only";
import { createServerSupabase } from "@/lib/db/server";

export async function listPeriods() {
  const s = await createServerSupabase();
  const { data } = await s.from("periods").select("*").order("sort_order");
  return data ?? [];
}

export async function timetableForArm(armId: string, termId: string) {
  const s = await createServerSupabase();
  const { data } = await s
    .from("timetable_entries")
    .select("*, subjects(name,code), periods(label,start_time,end_time,sort_order), users:staff_id(full_name,email)")
    .eq("class_arm_id", armId)
    .eq("term_id", termId);
  return data ?? [];
}

export async function currentTerm() {
  const s = await createServerSupabase();
  const { data } = await s
    .from("terms")
    .select("id,name,academic_sessions(name)")
    .eq("is_current", true)
    .maybeSingle();
  return data;
}