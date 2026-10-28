-- ─────────────────────────────────────────────────────────────
-- 0005_enrolments.sql
-- Student enrolments: which student is in which arm/term/session.
-- The students table itself lands in Phase 3; this table is
-- created now so academics is complete, but stays empty until
-- Phase 3 populates it.
-- ─────────────────────────────────────────────────────────────

create table public.enrolments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null,                -- references students(id) added in Phase 3
  class_arm_id uuid not null references public.class_arms(id),
  term_id      uuid not null references public.terms(id),
  session_id   uuid not null references public.academic_sessions(id),
  status       text not null default 'enrolled'
    check (status in ('enrolled','promoted','repeated','withdrawn','graduated')),
  enrolled_at  timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (student_id, term_id)
);
create index idx_enrolments_arm on public.enrolments (class_arm_id, term_id);
create index idx_enrolments_student on public.enrolments (student_id);
create trigger trg_enrolments_updated
  before update on public.enrolments
  for each row execute function public.tg_set_updated_at();

-- NOTE: Foreign key to students(id) will be added in Phase 3
-- via a separate migration once the students table exists.