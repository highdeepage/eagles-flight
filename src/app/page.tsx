import Link from "next/link";
import { createServerSupabase } from "@/lib/db/server";
import { listPublishedNews } from "@/lib/content/queries";
import { listFeaturedPhotos } from "@/lib/gallery/queries";
import { listUpcomingEvents } from "@/lib/events/queries";
import {
  GraduationCap,
  BookOpen,
  Users,
  Trophy,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Calendar,
  Newspaper,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 300;

interface Settings {
  school_name: string | null;
  short_name: string | null;
  motto: string | null;
  logo_url: string | null;
  address: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  email_primary: string | null;
  email_admissions: string | null;
  website: string | null;
  history: string | null;
  vision: string | null;
  mission: string | null;
  principal_name: string | null;
  principal_message: string | null;
  footer_text: string | null;
  brand_colors: { primary?: string; accent?: string } | null;
}

async function getSettings(): Promise<Settings | null> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("school_settings")
    .select(
      "school_name,short_name,motto,logo_url,address,phone_primary,phone_secondary,email_primary,email_admissions,website,history,vision,mission,principal_name,principal_message,footer_text,brand_colors",
    )
    .eq("id", 1)
    .single();
  return (data as Settings) ?? null;
}

function isPlaceholder(v: string | null | undefined): boolean {
  if (!v) return true;
  return /^\[.*\]$/.test(v.trim());
}

function valueOr(v: string | null | undefined, fallback: string): string {
  return isPlaceholder(v) ? fallback : (v as string);
}

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function HomePage() {
  const [settings, news, photos, events] = await Promise.all([
    getSettings(),
    listPublishedNews(3),
    listFeaturedPhotos(6),
    listUpcomingEvents(3),
  ]);

  const brand = settings?.brand_colors ?? {};
  const primary = brand.primary ?? "#1e3a8a";
  const accent = brand.accent ?? "#f59e0b";

  const schoolName = valueOr(
    settings?.school_name,
    "Eagles Flight Senior Secondary School",
  );
  const motto = settings?.motto ?? "Excellence in Education";
  const logoUrl = settings?.logo_url ?? null;

  const history = settings?.history;
  const vision = settings?.vision;
  const mission = settings?.mission;
  const principalName = settings?.principal_name;
  const principalMessage = settings?.principal_message;
  const address = settings?.address;
  const phonePrimary = settings?.phone_primary;
  const phoneSecondary = settings?.phone_secondary;
  const emailPrimary = settings?.email_primary;
  const emailAdmissions = settings?.email_admissions;
  const website = settings?.website;
  const footerText = valueOr(
    settings?.footer_text,
    `© ${new Date().getFullYear()} ${schoolName}. All rights reserved.`,
  );

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ═══ HEADER ═══════════════════════════════════════ */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={`${schoolName} logo`}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
                style={{ backgroundColor: primary }}
              >
                {schoolName.charAt(0)}
              </div>
            )}
            <div>
              <div
                className="font-display text-sm font-bold leading-tight sm:text-base"
                style={{ color: primary }}
              >
                {schoolName}
              </div>
              {settings?.short_name && (
                <div className="text-xs text-slate-500">{settings.short_name}</div>
              )}
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
          <Link href="/" className="transition hover:text-slate-900">Home</Link>
          <a href="#about" className="transition hover:text-slate-900">About</a>
          <a href="#academics" className="transition hover:text-slate-900">Academics</a>
          <Link href="/news" className="transition hover:text-slate-900">News</Link>
          <Link href="/gallery" className="transition hover:text-slate-900">Gallery</Link>
          <Link href="/events" className="transition hover:text-slate-900">Events</Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            Portal <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>

          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-white md:hidden"
            style={{ backgroundColor: primary }}
          >
            Portal
          </Link>
        </div>
      </header>

      {/* ═══ HERO ═════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, #0f172a 55%, #020617 100%)`,
        }}
      >
        {/* Decorative grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
          <div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur"
            >
              <Sparkles className="h-3 w-3" style={{ color: accent }} />
              <span style={{ color: accent }}>{motto}</span>
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              Welcome to
              <br />
              <span style={{ color: accent }}>{schoolName}</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              {isPlaceholder(mission)
                ? "A community of learners committed to academic excellence, character, and service."
                : mission}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                Access Portal <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#about"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Learn more
              </a>
            </div>
          </div>

          <div className="hidden md:flex md:justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full opacity-30 blur-3xl"
                style={{ backgroundColor: accent }}
              />
              <div className="relative flex h-80 w-80 items-center justify-center rounded-3xl border border-white/20 bg-white/5 shadow-2xl backdrop-blur-sm">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt=""
                    className="h-48 w-48 object-contain drop-shadow-2xl"
                  />
                ) : (
                  <GraduationCap className="h-40 w-40 text-white/50" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STAT STRIP ═══════════════════════════════════ */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-3">
          {[
            { icon: BookOpen, label: "Subjects offered", value: "12+" },
            { icon: Users, label: "Students enrolled", value: "Growing" },
            { icon: Trophy, label: "Years of excellence", value: "10+" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{ backgroundColor: `${primary}15`, color: primary }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-slate-900">
                    {s.value}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ ABOUT + VISION / MISSION ═════════════════════ */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-16 md:grid-cols-2 md:gap-20">
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: primary }}
            >
              About us
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 md:text-4xl">
              Where young minds take flight
            </h2>
            <p className="mt-6 leading-relaxed text-slate-600">
              {isPlaceholder(history)
                ? "Our school is dedicated to shaping well-rounded young people through rigorous academics, character formation, and co-curricular excellence."
                : history}
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${primary}15`, color: primary }}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Our Vision
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {isPlaceholder(vision)
                  ? "To be a leading institution known for academic distinction and moral integrity."
                  : vision}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${primary}15`, color: primary }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Our Mission
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {isPlaceholder(mission)
                  ? "To provide a nurturing environment where every student is equipped to reach their fullest potential."
                  : mission}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ACADEMICS ════════════════════════════════════ */}
      <section id="academics" className="bg-slate-50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <div
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: primary }}
            >
              Academics
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 md:text-4xl">
              A curriculum built for the future
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              A rigorous curriculum prepares our students for national
              examinations (WAEC, NECO) and university entrance, while building
              critical thinking, communication, and problem-solving skills.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Sciences",
                body: "Physics, Chemistry, Biology, Further Mathematics, Agricultural Science.",
                icon: BookOpen,
              },
              {
                title: "Arts & Humanities",
                body: "Literature, Government, Christian Religious Studies, Civic Education.",
                icon: Users,
              },
              {
                title: "Languages & Commercial",
                body: "English Language, Economics, and more across the senior secondary curriculum.",
                icon: GraduationCap,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${primary}15`, color: primary }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ LATEST NEWS ══════════════════════════════════ */}
      {news.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-end justify-between">
              <div>
                <div
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: primary }}
                >
                  News
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 md:text-4xl">
                  Latest from our school
                </h2>
              </div>
              <Link
                href="/news"
                className="hidden items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-slate-900 sm:inline-flex"
              >
                All news <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {news.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {post.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="aspect-[16/10] w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div
                      className="flex aspect-[16/10] items-center justify-center"
                      style={{ backgroundColor: `${primary}10` }}
                    >
                      <Newspaper className="h-12 w-12" style={{ color: `${primary}50` }} />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                      <span style={{ color: primary }}>
                        {post.category ?? "News"}
                      </span>
                      {post.published_at && (
                        <>
                          <span>·</span>
                          <span>
                            {new Date(post.published_at).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold text-slate-900 transition group-hover:text-slate-700">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {post.excerpt}
                      </p>
                    )}
                    <div
                      className="mt-4 flex items-center gap-1 text-sm font-semibold"
                      style={{ color: primary }}
                    >
                      Read more <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/news"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700"
              >
                All news <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ GALLERY PREVIEW ══════════════════════════════ */}
      {photos.length > 0 && (
        <section className="bg-slate-50 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-end justify-between">
              <div>
                <div
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: primary }}
                >
                  Gallery
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 md:text-4xl">
                  Life at school
                </h2>
              </div>
              <Link
                href="/gallery"
                className="hidden items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-slate-900 sm:inline-flex"
              >
                View gallery <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo, i) => (
                <Link
                  key={photo.id}
                  href="/gallery"
                  className={`group relative block overflow-hidden rounded-lg bg-slate-100 ${
                    i === 0 ? "sm:col-span-2 sm:row-span-2 sm:aspect-square" : "aspect-square"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbnail_url ?? photo.image_url}
                    alt={photo.caption ?? "School photo"}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      <div className="line-clamp-2">{photo.caption}</div>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700"
              >
                View gallery <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ PRINCIPAL WELCOME ════════════════════════════ */}
      {!isPlaceholder(principalName) || !isPlaceholder(principalMessage) ? (
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-6">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-sm md:p-12">
              <div
                className="absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-10 blur-3xl"
                style={{ backgroundColor: primary }}
              />
              <div className="relative">
                <div
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: primary }}
                >
                  Welcome message
                </div>
                <p className="mt-4 text-lg leading-relaxed text-slate-700 md:text-xl">
                  {isPlaceholder(principalMessage)
                    ? "Welcome to our school. We are delighted to have you visit us online."
                    : principalMessage}
                </p>
                {!isPlaceholder(principalName) && (
                  <div className="mt-6 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: primary }}
                    >
                      {principalName!.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {principalName}
                      </div>
                      <div className="text-xs text-slate-500">Principal</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ═══ UPCOMING EVENTS ══════════════════════════════ */}
      {events.length > 0 && (
        <section className="bg-slate-50 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-end justify-between">
              <div>
                <div
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: primary }}
                >
                  Events
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 md:text-4xl">
                  Upcoming at school
                </h2>
              </div>
              <Link
                href="/events"
                className="hidden items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-slate-900 sm:inline-flex"
              >
                All events <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 space-y-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href="/events"
                  className="group flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg text-white shadow-sm"
                    style={{ backgroundColor: primary }}
                  >
                    <div className="font-display text-2xl font-bold leading-none">
                      {new Date(event.start_at).getDate()}
                    </div>
                    <div className="mt-0.5 text-xs uppercase">
                      {new Date(event.start_at).toLocaleDateString(undefined, {
                        month: "short",
                      })}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-base font-semibold text-slate-900 transition group-hover:text-slate-700">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-slate-600">
                        {event.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatEventDate(event.start_at)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="hidden h-4 w-4 flex-shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700 sm:block" />
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/events"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700"
              >
                All events <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ CONTACT ══════════════════════════════════════ */}
      <section id="contact" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <div
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: primary }}
            >
              Contact
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 md:text-4xl">
              Get in touch
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              We'd love to hear from you. Visit, call, or send us an email.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                Visit us
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {isPlaceholder(address) ? "Address will appear here" : address}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                Call us
              </h3>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                {!isPlaceholder(phonePrimary) ? <div>{phonePrimary}</div> : <div>—</div>}
                {!isPlaceholder(phoneSecondary) && (
                  <div className="text-slate-500">{phoneSecondary}</div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                Email us
              </h3>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                {!isPlaceholder(emailPrimary) && (
                  <div>
                    <a href={`mailto:${emailPrimary}`} className="hover:underline">
                      {emailPrimary}
                    </a>
                  </div>
                )}
                {!isPlaceholder(emailAdmissions) && (
                  <div className="text-slate-500">
                    Admissions:{" "}
                    <a href={`mailto:${emailAdmissions}`} className="hover:underline">
                      {emailAdmissions}
                    </a>
                  </div>
                )}
                {isPlaceholder(emailPrimary) && isPlaceholder(emailAdmissions) && <div>—</div>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══════════════════════════════════════ */}
      <footer style={{ backgroundColor: "#0f172a" }} className="text-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" className="h-9 w-9 object-contain" />
                )}
                <div className="font-display text-lg font-bold">{schoolName}</div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                {footerText}
              </p>
            </div>

            <div>
              <div className="font-display text-sm font-semibold text-white">
                Quick links
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/60">
                <li>
                  <a href="#about" className="transition hover:text-white">About</a>
                </li>
                <li>
                  <a href="#academics" className="transition hover:text-white">Academics</a>
                </li>
                <li>
                  <Link href="/news" className="transition hover:text-white">News</Link>
                </li>
                <li>
                  <Link href="/gallery" className="transition hover:text-white">Gallery</Link>
                </li>
                <li>
                  <Link href="/events" className="transition hover:text-white">Events</Link>
                </li>
                <li>
                  <Link href="/login" className="transition hover:text-white">Portal sign-in</Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-display text-sm font-semibold text-white">
                Get in touch
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/60">
                {!isPlaceholder(phonePrimary) && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    {phonePrimary}
                  </li>
                )}
                {!isPlaceholder(emailPrimary) && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <a href={`mailto:${emailPrimary}`} className="transition hover:text-white">
                      {emailPrimary}
                    </a>
                  </li>
                )}
                {!isPlaceholder(address) && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span>{address}</span>
                  </li>
                )}
                {!isPlaceholder(website) && (
                  <li>
                    <a
                      href={website!}
                      className="transition hover:text-white"
                      target="_blank"
                      rel="noopener"
                    >
                      {website!.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              Eagles Flight School Management System
            </div>
            <div>Nigeria · English · NGN</div>
          </div>
        </div>
      </footer>
    </main>
  );
}