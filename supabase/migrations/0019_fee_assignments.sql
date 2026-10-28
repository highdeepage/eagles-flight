-- ─────────────────────────────────────────────────────────────
-- 0019_fee_assignments.sql
-- Link a specific enrolment to a specific fee structure.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.student_fee_assignments (
  id                uuid primary key default gen_random_uuid(),
  enrolment_id      uuid not null references public.enrolments(id) on delete cascade,
  fee_structure_id  uuid not null references public.fee_structures(id) on delete cascade,
  amount            numeric(12,2) not null check (amount >= 0),
  created_at        timestamptz not null default now(),
  unique (enrolment_id, fee_structure_id)
);
create index if not exists idx_fa_enrolment on public.student_fee_assignments (enrolment_id);

alter table public.student_fee_assignments enable row level security;

-- Read: admins, bursar, students (own), parents (their child)
create policy "fa_read_admin" on public.student_fee_assignments
  for select using (public.can_manage_people());

create policy "fa_read_student" on public.student_fee_assignments
  for select using (
    exists (
      select 1 from public.enrolments e
      where e.id = student_fee_assignments.enrolment_id
        and e.student_id = public.my_student_id()
    )
  );

create policy "fa_read_parent" on public.student_fee_assignments
  for select using (
    exists (
      select 1 from public.enrolments e
      join public.parent_student ps on ps.student_id = e.student_id
      join public.parents p on p.id = ps.parent_id
      where e.id = student_fee_assignments.enrolment_id
        and p.user_id = auth.uid()
    )
  );

-- Write: admin + bursar (can_manage_people includes admin/registrar/principal;
-- bursar doesn't have can_manage_people so we add explicit check)
create policy "fa_write_admin" on public.student_fee_assignments
  for all using (
    public.is_admin()
    or (select role from public.users where id = auth.uid()) in ('bursar')
  ) with check (
    public.is_admin()
    or (select role from public.users where id = auth.uid()) in ('bursar')
  );

-- Payments read for parent/student (own)
alter table public.payments enable row level security;

drop policy if exists "payments_read_admin" on public.payments;
drop policy if exists "payments_read_student" on public.payments;
drop policy if exists "payments_read_parent" on public.payments;
drop policy if exists "payments_write_admin" on public.payments;

create policy "payments_read_admin" on public.payments
  for select using (
    public.can_manage_people()
    or (select role from public.users where id = auth.uid()) in ('bursar')
  );

create policy "payments_read_student" on public.payments
  for select using (
    exists (
      select 1 from public.enrolments e
      where e.id = payments.enrolment_id
        and e.student_id = public.my_student_id()
    )
  );

create policy "payments_read_parent" on public.payments
  for select using (
    exists (
      select 1 from public.enrolments e
      join public.parent_student ps on ps.student_id = e.student_id
      join public.parents p on p.id = ps.parent_id
      where e.id = payments.enrolment_id
        and p.user_id = auth.uid()
    )
  );

create policy "payments_write_admin" on public.payments
  for all using (
    public.is_admin()
    or (select role from public.users where id = auth.uid()) in ('bursar')
  ) with check (
    public.is_admin()
    or (select role from public.users where id = auth.uid()) in ('bursar')
  );