import { Suspense } from "react";
import Link from "next/link";
import { createServerSupabase } from "@/lib/db/server";
import { LoginForm } from "./LoginForm";
import { GraduationCap, ArrowLeft, BookOpen, Users, Trophy } from "lucide-react";

export const metadata = { title: "Sign In — Eagles Flight" };

interface Settings {
  school_name: string | null;
  logo_url: string | null;
  motto: string | null;
  short_name: string | null;
  brand_colors: { primary?: string; accent?: string } | null;
}

async function getSettings(): Promise<Settings | null> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("school_settings")
    .select("school_name,logo_url,motto,short_name,brand_colors")
    .eq("id", 1)
    .single();
  return (data as Settings) ?? null;
}

export default async function LoginPage() {
  const settings = await getSettings();
  const brand = settings?.brand_colors ?? {};
  const primary = brand.primary ?? "#1e3a8a";
  const accent = brand.accent ?? "#f59e0b";
  const schoolName = settings?.school_name ?? "Eagles Flight";
  const logoUrl = settings?.logo_url;
  const motto = settings?.motto ?? "Excellence in Education";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — brand story */}
      <div
        className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, #0f172a 100%)`,
        }}
      >
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-white/10"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-10 w-10 object-contain" />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: accent }}
              >
                <GraduationCap className="h-6 w-6 text-slate-900" />
              </div>
            )}
            <div>
              <div className="font-display text-base font-bold">{schoolName}</div>
              <div className="text-xs text-white/70">{settings?.short_name}</div>
            </div>
          </Link>
        </div>

        <div className="max-w-md">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: accent }}
          >
            {motto}
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight">
            Your portal to academic excellence.
          </h2>
          <p className="mt-4 text-white/80">
            Access results, attendance, timetable, and school updates — all in one place.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            <li className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" style={{ color: accent }} />
              View results and report cards
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4" style={{ color: accent }} />
              Manage students, staff, and parents
            </li>
            <li className="flex items-center gap-2">
              <Trophy className="h-4 w-4" style={{ color: accent }} />
              Track attendance and academic progress
            </li>
          </ul>
        </div>

        <div className="text-xs text-white/50">
          © {new Date().getFullYear()} {schoolName}. All rights reserved.
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-col bg-white">
        {/* Top bar with back link (visible on mobile + desktop) */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 lg:border-b-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
          <div className="text-sm font-medium text-slate-500">Sign in</div>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile-only brand header */}
            <div className="mb-8 text-center lg:hidden">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={schoolName}
                  className="mx-auto h-14 w-14 object-contain"
                />
              ) : (
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ backgroundColor: primary }}
                >
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
              )}
              <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
                {schoolName}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{motto}</p>
            </div>

            {/* Desktop-only welcome text */}
            <div className="mb-8 hidden lg:block">
              <h1 className="font-display text-3xl font-bold text-slate-900">
                Welcome back
              </h1>
              <p className="mt-2 text-slate-600">
                Sign in to your account to continue.
              </p>
            </div>

            <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
              <LoginForm primaryColor={primary} accentColor={accent} />
            </Suspense>

            <p className="mt-8 text-center text-xs text-slate-400">
              Having trouble signing in?{" "}
              <a href="/#contact" className="text-blue-700 hover:underline">
                Contact the school
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}