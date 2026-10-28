import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";

export default async function AcademicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const tabs = [
    { href: "/admin/academics/sessions", label: "Sessions" },
    { href: "/admin/academics/terms", label: "Terms" },
    { href: "/admin/academics/classes", label: "Classes" },
    { href: "/admin/academics/arms", label: "Class Arms" },
    { href: "/admin/academics/departments", label: "Departments" },
    { href: "/admin/academics/subjects", label: "Subjects" },
    { href: "/admin/academics/assignments", label: "Assignments" },
    { href: "/admin/academics/assessment", label: "Assessment & Grading" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Structure</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sessions, terms, classes, subjects and grading.
        </p>
      </div>
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="whitespace-nowrap border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}