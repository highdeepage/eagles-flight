import { createServerSupabase } from "@/lib/db/server";
import { requireRole } from "@/lib/auth/session";
import { currentTerm } from "@/lib/timetable/queries";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "My Timetable — Teacher" };

const DAYS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
};

export default async function TeacherTimetablePage() {
  const user = await requireRole("teacher", "class_teacher");
  const s = await createServerSupabase();
  const term = await currentTerm();

  const { data: entries } = term
    ? await s
        .from("timetable_entries")
        .select(
          "day_of_week, subjects(name,code), periods(label,start_time,end_time,sort_order), class_arms(arm_name, classes(name)), room",
        )
        .eq("staff_id", user.id)
        .eq("term_id", term.id)
    : { data: [] as any[] };

  const byDay: Record<number, any[]> = {};
  for (const e of (entries ?? []) as any[]) {
    (byDay[e.day_of_week] ??= []).push(e);
  }
  for (const d of Object.keys(byDay)) {
    byDay[Number(d)].sort(
      (a, b) => (a.periods?.sort_order ?? 0) - (b.periods?.sort_order ?? 0),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Timetable</h1>
        <p className="mt-1 text-sm text-slate-500">
          {term
            ? `${(term as any).academic_sessions?.name} — ${term.name}`
            : "No current term."}
        </p>
      </div>

      {[1, 2, 3, 4, 5].map((d) => (
        <Card key={d}>
          <CardHeader title={DAYS[d]} />
          <CardBody>
            {!byDay[d] || byDay[d].length === 0 ? (
              <p className="text-sm text-slate-500">No classes scheduled.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {byDay[d].map((e: any, i: number) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded border border-slate-200 p-2"
                  >
                    <div>
                      <div className="font-medium">
                        {e.periods?.label} — {e.subjects?.code}
                      </div>
                      <div className="text-xs text-slate-500">
                        {e.class_arms?.classes?.name} {e.class_arms?.arm_name} ·{" "}
                        {e.room ?? "no room"}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {e.periods?.start_time?.slice(0, 5)} –{" "}
                      {e.periods?.end_time?.slice(0, 5)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}