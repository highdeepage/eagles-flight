-- ─────────────────────────────────────────────────────────────
-- 0004_academics.sql
-- Sessions, terms, classes, class arms, departments, subjects,
-- class-subjects, teacher assignments, assessment components,
-- grading schemes, grade bands.
-- ─────────────────────────────────────────────────────────────

-- ── Academic sessions ────────────────────────────────────────
create table public.academic_sessions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,          -- e.g. '2025/2026'
  start_date  date not null,
  end_date    date not null,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (end_date > start_date)
);
create trigger trg_sessions_updated
  before update on public.academic_sessions
  for each row execute function public.tg_set_updated_at();

-- Only one current session
create unique index uniq_current_session
  on public.academic_sessions (is_current)
  where is_current = true;

-- ── Terms ────────────────────────────────────────────────────
create table public.terms (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.academic_sessions(id) on delete cascade,
  name        text not null,                 -- 'Term 1', 'Term 2', 'Term 3'
  start_date  date,
  end_date    date,
  is_current  boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (session_id, name)
);
create trigger trg_terms_updated
  before update on public.terms
  for each row execute function public.tg_set_updated_at();

-- Only one current term per session
create unique index uniq_current_term_per_session
  on public.terms (session_id, is_current)
  where is_current = true;

-- ── Departments ──────────────────────────────────────────────
create table public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_departments_updated
  before update on public.departments
  for each row execute function public.tg_set_updated_at();

-- ── Classes ──────────────────────────────────────────────────
create table public.classes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,          -- 'SSS 1'
  level       int,                           -- optional numeric level
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_classes_updated
  before update on public.classes
  for each row execute function public.tg_set_updated_at();

-- ── Class arms ───────────────────────────────────────────────
create table public.class_arms (
  id               uuid primary key default gen_random_uuid(),
  class_id         uuid not null references public.classes(id) on delete cascade,
  arm_name         text not null,            -- 'A', 'B', 'Gold'
  class_teacher_id uuid references public.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (class_id, arm_name)
);
create index idx_arms_class on public.class_arms (class_id);
create trigger trg_arms_updated
  before update on public.class_arms
  for each row execute function public.tg_set_updated_at();

-- ── Subjects ─────────────────────────────────────────────────
create table public.subjects (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  code          text not null unique,        -- 'MTH', 'ENG'
  department_id uuid references public.departments(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_subjects_updated
  before update on public.subjects
  for each row execute function public.tg_set_updated_at();

-- ── Class ↔ Subject ──────────────────────────────────────────
create table public.class_subjects (
  class_id   uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  primary key (class_id, subject_id)
);

-- ── Teacher assignments ──────────────────────────────────────
create table public.teacher_assignments (
  id           uuid primary key default gen_random_uuid(),
  staff_id     uuid not null references public.users(id) on delete cascade,
  subject_id   uuid not null references public.subjects(id) on delete cascade,
  class_arm_id uuid not null references public.class_arms(id) on delete cascade,
  term_id      uuid not null references public.terms(id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (staff_id, subject_id, class_arm_id, term_id)
);
create index idx_ta_staff on public.teacher_assignments (staff_id, term_id);
create index idx_ta_arm on public.teacher_assignments (class_arm_id, term_id);
create trigger trg_ta_updated
  before update on public.teacher_assignments
  for each row execute function public.tg_set_updated_at();

-- ── Assessment components (CA / Exam weights) ────────────────
create table public.assessment_components (
  id         uuid primary key default gen_random_uuid(),
  term_id    uuid not null references public.terms(id) on delete cascade,
  name       text not null,                  -- 'CA', 'Exam'
  weight     int not null check (weight > 0 and weight <= 100),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (term_id, name)
);
create trigger trg_ac_updated
  before update on public.assessment_components
  for each row execute function public.tg_set_updated_at();

-- ── Grading schemes ──────────────────────────────────────────
create table public.grading_schemes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_gs_updated
  before update on public.grading_schemes
  for each row execute function public.tg_set_updated_at();

-- Only one default grading scheme
create unique index uniq_default_grading_scheme
  on public.grading_schemes (is_default)
  where is_default = true;

-- ── Grade bands ──────────────────────────────────────────────
create table public.grade_bands (
  id           uuid primary key default gen_random_uuid(),
  scheme_id    uuid not null references public.grading_schemes(id) on delete cascade,
  grade        text not null,                -- 'A', 'B', 'C', 'F'
  min_score    int not null check (min_score >= 0 and min_score <= 100),
  max_score    int not null check (max_score >= 0 and max_score <= 100),
  remark       text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  check (max_score >= min_score),
  unique (scheme_id, grade)
);