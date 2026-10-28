import { listPeriods, timetableForArm, currentTerm } from "@/lib/timetable/queries";
import { createServerSupabase } from "@/lib/db/server";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { PeriodsForm } from "./PeriodsForm";
import { TimetableEditor } from "./TimetableEditor";

export const metadata = { title: "Timetable — Admin" };

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ arm?: string }>;
}) {
  const p = await searchParams;
  const s = await createServerSupabase();

  const [periods, term, armsRes, subjectsRes, teachersRes] = await Promise.all([
    listPeriods(),
    currentTerm(),
    s.from("class_arms").select("id,arm_name,classes(name)").order("arm_name"),
    s.from("subjects").select("id,name,code").order("name"),
    s
      .from("users")
      .select("id,full_name,email")
      .in("role", ["teacher", "class_teacher"])
      .eq("is_active", true),
  ]);

  const arms = armsRes.data ?? [];
  const subjects = subjectsRes.data ?? [];
  const teachers = teachersRes.data ?? [];

  const selectedArm = p.arm ?? arms[0]?.id ?? "";
  const entries =
    selectedArm && term ? await timetableForArm(selectedArm, term.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Timetable</h1>
        <p className="mt-1 text-sm text-slate-500">
          {term
            ? `Current term: ${(term as any).academic_sessions?.name} — ${term.name}`
            : "No current term set."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Class timetable" />
          <CardBody>
            {periods.length === 0 ? (
              <p className="text-sm text-slate-500">
                Create periods first (right panel).
              </p>
            ) : (
              <TimetableEditor
                arms={arms}
                periods={periods}
                subjects={subjects}
                teachers={teachers}
                selectedArm={selectedArm}
                termId={term?.id ?? ""}
                entries={entries}
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Periods" description="Bell schedule" />
          <CardBody>
            <ul className="mb-4 space-y-1 text-sm">
              {periods.map((period) => (
                <li key={period.id} className="flex justify-between">
                  <span>{period.label}</span>
                  <span className="text-xs text-slate-500">
                    {period.start_time.slice(0, 5)} –{" "}
                    {period.end_time.slice(0, 5)}
                  </span>
                </li>
              ))}
            </ul>
            <PeriodsForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}