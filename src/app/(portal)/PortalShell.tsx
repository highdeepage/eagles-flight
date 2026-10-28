"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  Clock,
  FileCheck2,
  ScrollText,
  Settings,
  ListChecks,
  Shield,
  Activity,
  Menu,
  LogOut,
  Newspaper,
  Image as ImageIcon,
  Calendar,
  CalendarDays,
  Building2,
  BookMarked,
  Layers,
  ListTree,
  Wallet,
} from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import type { SessionUser } from "@/lib/auth/session";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/staff", label: "Staff", icon: UserCheck },
    { href: "/admin/parents", label: "Parents", icon: UserPlus },
    { href: "/admin/enrolments", label: "Enrolments", icon: GraduationCap },
    { href: "/admin/academics/sessions", label: "Sessions", icon: CalendarDays },
    { href: "/admin/academics/terms", label: "Terms", icon: Calendar },
    { href: "/admin/academics/classes", label: "Classes", icon: ListTree },
    { href: "/admin/academics/arms", label: "Class Arms", icon: Layers },
    { href: "/admin/academics/departments", label: "Departments", icon: Building2 },
    { href: "/admin/academics/subjects", label: "Subjects", icon: BookMarked },
    { href: "/admin/academics/assignments", label: "Assignments", icon: BookOpen },
    { href: "/admin/academics/assessment", label: "Assessment", icon: FileCheck2 },
    { href: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/admin/timetable", label: "Timetable", icon: Clock },
    { href: "/admin/results/review", label: "Review Results", icon: FileCheck2 },
    { href: "/admin/report-cards", label: "Report Cards", icon: ScrollText },
    { href: "/admin/fees", label: "Fees", icon: Wallet },
    { href: "/admin/news", label: "News", icon: Newspaper },
    { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/settings", label: "School Settings", icon: Settings },
    { href: "/admin/lists", label: "System Lists", icon: ListChecks },
    { href: "/admin/users", label: "Users", icon: Shield },
    { href: "/admin/audit", label: "Audit Log", icon: Activity },
  ],
  principal: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/staff", label: "Staff", icon: UserCheck },
    { href: "/admin/academics/sessions", label: "Sessions", icon: CalendarDays },
    { href: "/admin/academics/terms", label: "Terms", icon: Calendar },
    { href: "/admin/academics/classes", label: "Classes", icon: ListTree },
    { href: "/admin/academics/departments", label: "Departments", icon: Building2 },
    { href: "/admin/academics/subjects", label: "Subjects", icon: BookMarked },
    { href: "/admin/results/review", label: "Review Results", icon: FileCheck2 },
    { href: "/admin/report-cards", label: "Report Cards", icon: ScrollText },
    { href: "/admin/fees", label: "Fees", icon: Wallet },
    { href: "/admin/settings", label: "School Settings", icon: Settings },
    { href: "/admin/audit", label: "Audit Log", icon: Activity },
  ],
  registrar: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/staff", label: "Staff", icon: UserCheck },
    { href: "/admin/parents", label: "Parents", icon: UserPlus },
    { href: "/admin/enrolments", label: "Enrolments", icon: GraduationCap },
    { href: "/admin/academics/sessions", label: "Sessions", icon: CalendarDays },
    { href: "/admin/academics/terms", label: "Terms", icon: Calendar },
    { href: "/admin/academics/classes", label: "Classes", icon: ListTree },
    { href: "/admin/academics/arms", label: "Class Arms", icon: Layers },
    { href: "/admin/academics/departments", label: "Departments", icon: Building2 },
    { href: "/admin/academics/subjects", label: "Subjects", icon: BookMarked },
    { href: "/admin/fees", label: "Fees", icon: Wallet },
  ],
  bursar: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/fees", label: "Fees", icon: Wallet },
    { href: "/admin/students", label: "Students", icon: Users },
  ],
  vice_principal: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/staff", label: "Staff", icon: UserCheck },
  ],
  teacher: [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/teacher/timetable", label: "Timetable", icon: Clock },
    { href: "/teacher/results", label: "Results", icon: FileCheck2 },
  ],
  class_teacher: [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/teacher/timetable", label: "Timetable", icon: Clock },
    { href: "/teacher/results", label: "Results", icon: FileCheck2 },
  ],
  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/report-card", label: "My Report Card", icon: ScrollText },
  ],
  parent: [
    { href: "/parent", label: "Dashboard", icon: LayoutDashboard },
    { href: "/parent/fees", label: "Fees", icon: Wallet },
  ],
};

export function PortalShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const nav = NAV_BY_ROLE[user.role] ?? [];

  const isActive = (href: string) => {
    if (["/admin", "/teacher", "/student", "/parent"].includes(href)) {
      return path === href;
    }
    return path === href || path.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="rounded p-1.5 text-white/80 hover:bg-white/10 lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 font-display font-semibold text-white"
            >
              <GraduationCap className="h-5 w-5 text-amber-400" />
              Eagles Flight
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm sm:block">
              <div className="font-medium text-white">
                {user.full_name ?? user.email}
              </div>
              <div className="text-xs capitalize text-white/60">
                {user.role.replace(/_/g, " ")}
              </div>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`${open ? "block" : "hidden"} w-full border-r border-slate-800 bg-slate-900 lg:block lg:w-64`}
        >
          <nav className="space-y-0.5 overflow-y-auto p-3 lg:max-h-[calc(100vh-3.5rem)]">
            {nav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-white/15 font-medium text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}