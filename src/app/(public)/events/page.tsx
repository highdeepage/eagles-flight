import Link from "next/link";
import { listUpcomingEvents, listPastEvents } from "@/lib/events/queries";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Events",
  description: "Upcoming events at Eagles Flight Senior Secondary School.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short" });
}

function dayNum(iso: string) {
  return new Date(iso).getDate();
}

export default async function PublicEventsPage() {
  const [upcoming, past] = await Promise.all([
    listUpcomingEvents(),
    listPastEvents(10),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* ── Public nav ───────────────────────────────── */}
      <nav className="mb-10 flex items-center gap-6 border-b border-slate-200 pb-4 text-sm font-medium text-slate-600">
        <Link href="/" className="transition hover:text-slate-900">
          Home
        </Link>
        <Link href="/news" className="transition hover:text-slate-900">
          News
        </Link>
        <Link href="/gallery" className="transition hover:text-slate-900">
          Gallery
        </Link>
        <Link href="/events" className="text-slate-900">
          Events
        </Link>
      </nav>

      {/* ── Heading ──────────────────────────────────── */}
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-blue-700">
          Events
        </div>
        <h1 className="mt-2 font-display text-4xl font-bold text-slate-900">
          What&apos;s happening at school
        </h1>
        <p className="mt-3 text-slate-500">
          Mark your calendar and join us for these upcoming activities.
        </p>
      </div>

      {/* ── Upcoming ─────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Upcoming
        </h2>

        {upcoming.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Calendar className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No upcoming events scheduled
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Check back soon for new activities.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {upcoming.map((event) => (
              <li
                key={event.id}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-5"
              >
                {/* Date badge */}
                <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm">
                  <div className="font-display text-2xl font-bold leading-none">
                    {dayNum(event.start_at)}
                  </div>
                  <div className="mt-0.5 text-xs uppercase tracking-wide">
                    {monthLabel(event.start_at)}
                  </div>
                </div>

                {/* Event details */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold text-slate-900">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {event.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(event.start_at)}
                    </span>
                    {!event.is_all_day && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(event.start_at)}
                        {event.end_at && ` – ${formatTime(event.end_at)}`}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Past ─────────────────────────────────────── */}
      {past.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Past events
          </h2>
          <ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {past.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {event.title}
                  </div>
                  {event.location && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs text-slate-500">
                  {new Date(event.start_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Back to home ─────────────────────────────── */}
      <div className="mt-14 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
        >
          Back to homepage <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}