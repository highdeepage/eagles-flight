import { listSessions } from "@/lib/academics/queries";
import { SessionsForm } from "./SessionsForm";
import { SetCurrentButton } from "./SetCurrentButton";
import { Card, CardBody, CardHeader } from "@/components/ui";

export const metadata = { title: "Sessions — Admin" };

export default async function SessionsPage() {
  const sessions = await listSessions();
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader title="All sessions" description={`${sessions.length} sessions`} />
        <CardBody>
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Start</th>
                <th className="py-2">End</th>
                <th className="py-2">Current</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 font-medium">{s.name}</td>
                  <td className="py-2">{s.start_date}</td>
                  <td className="py-2">{s.end_date}</td>
                  <td className="py-2">
                    {s.is_current ? (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        Current
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <SetCurrentButton id={s.id} isCurrent={s.is_current} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="New session" />
        <CardBody>
          <SessionsForm />
        </CardBody>
      </Card>
    </div>
  );
}