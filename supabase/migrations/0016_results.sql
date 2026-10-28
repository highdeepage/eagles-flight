-- ─────────────────────────────────────────────────────────────
-- 0016_results.sql
-- ─────────────────────────────────────────────────────────────

create table public.result_records (
  id             uuid primary key default gen_random_uuid(),
  enrolment_id   uuid not null references public.enrolments(id) on delete cascade,
  subject_id     uuid not null references public.subjects(id) on delete cascade,
  component_id   uuid not null references public.assessment_components(id) on delete cascade,
  score          numeric(5,2) not null check (score >= 0),
  entered_by     uuid references public.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (enrolment_id, subject_id, component_id)
);
create index idx_rr_enrol_subject on public.result_records (enrolment_id, subject_id);
create trigger trg_rr_updated
  before update on public.result_records
  for each row execute function public.tg_set_updated_at();

create table public.result_submissions (
  id             uuid primary key default gen_random_uuid(),
  enrolment_id   uuid not null references public.enrolments(id) on delete cascade,
  subject_id     uuid not null references public.subjects(id) on delete cascade,
  term_id        uuid not null references public.terms(id) on delete cascade,
  status         text not null default 'draft'
    check (status in ('draft','submitted','approved','returned','published')),
  submitted_by   uuid references public.users(id) on delete set null,
  submitted_at   timestamptz,
  approved_by    uuid references public.users(id) on delete set null,
  approved_at    timestamptz,
  published_at   timestamptz,
  return_reason  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (enrolment_id, subject_id, term_id)
);
create index idx_rs_term_status on public.result_submissions (term_id, status);
create trigger trg_rs_updated
  before update on public.result_submissions
  for each row execute function public.tg_set_updated_at();