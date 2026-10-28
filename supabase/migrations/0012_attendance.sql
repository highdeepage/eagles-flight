-- ─────────────────────────────────────────────────────────────
-- 0012_attendance.sql
-- ─────────────────────────────────────────────────────────────

create table public.attendance_records (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students(id) on delete cascade,
  class_arm_id  uuid not null references public.class_arms(id) on delete cascade,
  term_id       uuid not null references public.terms(id) on delete cascade,
  date          date not null,
  status        text not null,             -- from system_lists 'attendance_status'
  note          text,
  recorded_by   uuid references public.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (student_id, date)
);
create index idx_att_arm_date on public.attendance_records (class_arm_id, date);
create index idx_att_student on public.attendance_records (student_id, date);
create trigger trg_attendance_updated
  before update on public.attendance_records
  for each row execute function public.tg_set_updated_at();