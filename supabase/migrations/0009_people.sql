-- ─────────────────────────────────────────────────────────────
-- 0009_people.sql
-- Students, staff, parents, parent-student links.
-- Passport photo paths, not blobs.
-- ─────────────────────────────────────────────────────────────

-- ── Students ─────────────────────────────────────────────────
create table public.students (
  id                 uuid primary key default gen_random_uuid(),
  admission_no       text not null unique,
  surname            text not null,
  first_name         text not null,
  other_names        text,
  gender             text not null,           -- validated in app: from system_lists 'gender'
  date_of_birth      date,
  photo_path         text,
  phone              text,
  email              citext,
  address            text,
  state_of_origin    text,
  lga                text,
  nationality        text default 'Nigerian',
  religion           text,
  blood_group        text,
  genotype           text,
  previous_school    text,
  admission_date     date default current_date,
  status             text not null default 'active',
  user_id            uuid references public.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_students_name on public.students (surname, first_name);
create index idx_students_name_trgm on public.students using gin ((surname || ' ' || first_name) gin_trgm_ops);
create index idx_students_status on public.students (status);
create index idx_students_user on public.students (user_id);
create trigger trg_students_updated
  before update on public.students
  for each row execute function public.tg_set_updated_at();

-- Now we can add the FK from enrolments to students
alter table public.enrolments
  add constraint fk_enrolments_student
  foreign key (student_id) references public.students(id) on delete cascade;

-- ── Staff ────────────────────────────────────────────────────
create table public.staff (
  id                 uuid primary key default gen_random_uuid(),
  staff_no           text not null unique,
  surname            text not null,
  first_name         text not null,
  other_names        text,
  gender             text,
  date_of_birth      date,
  photo_path         text,
  phone              text,
  email              citext,
  address            text,
  department_id      uuid references public.departments(id) on delete set null,
  designation        text,
  qualifications     text,
  employment_status  text not null default 'active',
  employment_date    date,
  user_id            uuid references public.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_staff_name on public.staff (surname, first_name);
create index idx_staff_name_trgm on public.staff using gin ((surname || ' ' || first_name) gin_trgm_ops);
create index idx_staff_user on public.staff (user_id);
create trigger trg_staff_updated
  before update on public.staff
  for each row execute function public.tg_set_updated_at();

-- ── Parents ──────────────────────────────────────────────────
create table public.parents (
  id                 uuid primary key default gen_random_uuid(),
  surname            text not null,
  first_name         text not null,
  other_names        text,
  relationship       text,                    -- from system_lists 'relationship'
  phone              text,
  email              citext,
  address            text,
  occupation         text,
  photo_path         text,
  user_id            uuid references public.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_parents_name on public.parents (surname, first_name);
create index idx_parents_user on public.parents (user_id);
create trigger trg_parents_updated
  before update on public.parents
  for each row execute function public.tg_set_updated_at();

-- ── Parent ↔ Student ─────────────────────────────────────────
create table public.parent_student (
  parent_id     uuid not null references public.parents(id) on delete cascade,
  student_id    uuid not null references public.students(id) on delete cascade,
  relationship  text,                         -- from system_lists
  is_primary    boolean not null default false,
  primary key (parent_id, student_id)
);
create index idx_ps_student on public.parent_student (student_id);

-- ── Storage bucket for student/staff photos ──────────────────
insert into storage.buckets (id, name, public)
values ('passports', 'passports', false)
on conflict (id) do nothing;

-- Authenticated users can read passports (RLS at table level restricts access)
create policy "passports_read_auth"
  on storage.objects for select
  using (bucket_id = 'passports' and auth.uid() is not null);

create policy "passports_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'passports' and public.is_admin());

create policy "passports_admin_update"
  on storage.objects for update
  using (bucket_id = 'passports' and public.is_admin());

create policy "passports_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'passports' and public.is_admin());