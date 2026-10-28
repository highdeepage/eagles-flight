-- ─────────────────────────────────────────────────────────────
-- 0010_people_policies.sql
-- RLS for students, staff, parents, parent_student.
-- Admins/registrars/principals: full access.
-- Teachers: read students (for their classes).
-- Students: read own record.
-- Parents: read own record + linked children.
-- ─────────────────────────────────────────────────────────────

alter table public.students       enable row level security;
alter table public.staff          enable row level security;
alter table public.parents        enable row level security;
alter table public.parent_student enable row level security;

-- Helper functions
create or replace function public.can_manage_people()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role from public.users where id = auth.uid())
    in ('admin','principal','registrar'),
    false
  );
$$;

create or replace function public.my_student_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.students where user_id = auth.uid() limit 1;
$$;

create or replace function public.my_parent_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.parents where user_id = auth.uid() limit 1;
$$;

-- ── Students ─────────────────────────────────────────────────
create policy "students_manage" on public.students
  for all using (public.can_manage_people()) with check (public.can_manage_people());

create policy "students_teacher_read" on public.students
  for select using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('teacher','class_teacher')
    )
  );

create policy "students_self_read" on public.students
  for select using (user_id = auth.uid());

create policy "students_parent_read" on public.students
  for select using (
    exists (
      select 1 from public.parent_student ps
      join public.parents p on p.id = ps.parent_id
      where ps.student_id = students.id and p.user_id = auth.uid()
    )
  );

-- ── Staff ────────────────────────────────────────────────────
create policy "staff_manage" on public.staff
  for all using (public.can_manage_people()) with check (public.can_manage_people());

create policy "staff_self_read" on public.staff
  for select using (user_id = auth.uid());

create policy "staff_public_directory" on public.staff
  for select using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
    )
  );

-- ── Parents ──────────────────────────────────────────────────
create policy "parents_manage" on public.parents
  for all using (public.can_manage_people()) with check (public.can_manage_people());

create policy "parents_self_read" on public.parents
  for select using (user_id = auth.uid());

-- ── Parent-Student links ────────────────────────────────────
create policy "ps_manage" on public.parent_student
  for all using (public.can_manage_people()) with check (public.can_manage_people());

create policy "ps_parent_read" on public.parent_student
  for select using (
    exists (
      select 1 from public.parents p
      where p.id = parent_student.parent_id and p.user_id = auth.uid()
    )
  );

create policy "ps_student_read" on public.parent_student
  for select using (
    exists (
      select 1 from public.students s
      where s.id = parent_student.student_id and s.user_id = auth.uid()
    )
  );