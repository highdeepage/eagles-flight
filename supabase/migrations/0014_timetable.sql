-- ─────────────────────────────────────────────────────────────
-- 0014_timetable.sql
-- ─────────────────────────────────────────────────────────────

create table public.periods (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,          -- "Period 1", "Break", "Period 2"
  start_time  time not null,
  end_time    time not null,
  sort_order  int not null default 0,
  is_break    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.timetable_entries (
  id            uuid primary key default gen_random_uuid(),
  class_arm_id  uuid not null references public.class_arms(id) on delete cascade,
  term_id       uuid not null references public.terms(id) on delete cascade,
  period_id     uuid not null references public.periods(id) on delete cascade,
  day_of_week   int not null check (day_of_week between 1 and 5),   -- 1=Mon..5=Fri
  subject_id    uuid references public.subjects(id) on delete set null,
  staff_id      uuid references public.users(id) on delete set null,
  room          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (class_arm_id, term_id, period_id, day_of_week)
);
create trigger trg_tt_updated
  before update on public.timetable_entries
  for each row execute function public.tg_set_updated_at();

alter table public.periods           enable row level security;
alter table public.timetable_entries enable row level security;

create policy "periods_read" on public.periods for select using (auth.uid() is not null);
create policy "periods_write" on public.periods for all using (public.can_manage_academics()) with check (public.can_manage_academics());

create policy "tt_read" on public.timetable_entries for select using (auth.uid() is not null);
create policy "tt_write" on public.timetable_entries for all using (public.can_manage_academics()) with check (public.can_manage_academics());