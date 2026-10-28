import Link from "next/link";
import { createServerSupabase } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/session";
import { Card, CardBody, CardHeader, Empty } from "@/components/ui";
import {
  Users,
  UserCheck,
  UserPlus,
  Shield,
  BookOpen,
  Settings,
  ListChecks,
  Activity,
  Plus,
} from "lucide-react";

export const metadata = { title: "Admin Dashboard — Eagles Flight" };

async function countRows(table: string): Promise<number> {
  const s = await createServerSupabase();
  const { count } = await s.from(table).select("id", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminDashboard() {
  const user = await requireAdmin();
  const supabase = await createServerSupabase();

  const [students, staff, parents, users, roles, lists, recent] = await Promise.all([
    countRows("students"),
    countRows("staff"),
    countRows("parents"),
    countRows("users"),
    countRows("roles"),
    countRows("system_lists"),
    supabase
      .from("audit_log")
      .select("id,actor_email,action,entity,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const stats = [
    { label: "Students", value: students, href: "/admin/students", icon: Users, color: "bg-blue-50 text-blue-700" },
    { label: "Staff", value: staff, href: "/admin/staff", icon: UserCheck, color: "bg-emerald-50 text-emerald-700" },
    { label: "Parents", value: parents, href: "/admin/parents", icon: UserPlus, color: "bg-violet-50 text-violet-700" },
    { label: "Users", value: users, href: "/admin/users", icon: Shield, color: "bg-amber-50 text-amber-700" },
  ];

  const quickActions = [
    { href: "/admin/students/new", label: "Register student", icon: Users },
    { href: "/admin/staff/new", label: "Add staff", icon: UserCheck },
    { href: "/admin/parents/new", label: "Add parent", icon: UserPlus },
    { href: "/admin/academics/sessions", label: "Academic setup", icon: BookOpen },
    { href: "/admin/settings", label: "School settings", icon: Settings },
    { href: "/admin/lists", label: "System lists", icon: ListChecks },
  ];

  const recentRows = recent.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Welcome, {user.full_name ?? user.email}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your school. Live data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="hover:border-slate-300">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 font-display text-3xl font-semibold text-slate-900">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{s.label}</div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader title="Quick actions" icon={<Plus className="h-4 w-4" />} />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm transition hover:border-blue-300 hover:bg-blue-50/30"
                >
                  <Icon className="h-4 w-4 text-blue-700" />
                  <span className="font-medium">{a.label}</span>
                </Link>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader title="System configuration" icon={<Settings className="h-4 w-4" />} />
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Roles</span>
              <span className="font-semibold">{roles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">List items</span>
              <span className="font-semibold">{lists}</span>
            </div>
            <Link href="/admin/audit" className="inline-flex items-center gap-1 text-blue-700 hover:underline">
              <Activity className="h-3 w-3" /> View full audit log →
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent activity" description="Last 8 actions" icon={<Activity className="h-4 w-4" />} />
          <CardBody>
            {recentRows.length === 0 ? (
              <Empty title="No activity yet" description="Create a record to see it here." />
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {recentRows.map((e: any) => (
                  <li key={e.id} className="flex items-start justify-between gap-3 py-2">
                    <div>
                      <div className="font-mono text-xs text-slate-500">{e.action}</div>
                      <div className="text-slate-800">{e.entity}</div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(e.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {students + staff + parents === 0 && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardHeader title="Get started" />
          <CardBody>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>
                <Link href="/admin/settings" className="text-blue-700 hover:underline">
                  Fill in school details
                </Link>
              </li>
              <li>
                <Link href="/admin/academics/sessions" className="text-blue-700 hover:underline">
                  Set up academic structure
                </Link>
              </li>
              <li>
                <Link href="/admin/staff/new" className="text-blue-700 hover:underline">
                  Add your staff
                </Link>
              </li>
              <li>
                <Link href="/admin/students/new" className="text-blue-700 hover:underline">
                  Register your first student
                </Link>
              </li>
            </ol>
          </CardBody>
        </Card>
      )}
    </div>
  );
}