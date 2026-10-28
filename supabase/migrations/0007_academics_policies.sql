-- ─────────────────────────────────────────────────────────────
-- 0007_academics_policies.sql
-- RLS for all Phase 2 tables.
-- Read: any authenticated user. Write: admin/principal/registrar.
-- ─────────────────────────────────────────────────────────────

alter table public.academic_sessions     enable row level security;
alter table public.terms                 enable row level security;
alter table public.departments           enable row level security;
alter table public.classes               enable row level security;
alter table public.class_arms            enable row level security;
alter table public.subjects              enable row level security;
alter table public.class_subjects        enable row level security;
alter table public.teacher_assignments   enable row level security;
alter table public.assessment_components enable row level security;
alter table public.grading_schemes       enable row level security;
alter table public.grade_bands           enable row level security;
alter table public.enrolments            enable row level security;
alter table public.fee_structures        enable row level security;
alter table public.payments              enable row level security;

-- Helper: can this user write academic structure?
create or replace function public.can_manage_academics()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.users where id = auth.uid())
    in ('admin','principal','registrar'),
    false
  );
$$;

-- Read: authenticated users
create policy "read_auth_sessions"    on public.academic_sessions     for select using (auth.uid() is not null);
create policy "read_auth_terms"       on public.terms                 for select using (auth.uid() is not null);
create policy "read_auth_departments" on public.departments           for select using (auth.uid() is not null);
create policy "read_auth_classes"     on public.classes               for select using (auth.uid() is not null);
create policy "read_auth_arms"        on public.class_arms            for select using (auth.uid() is not null);
create policy "read_auth_subjects"    on public.subjects              for select using (auth.uid() is not null);
create policy "read_auth_cs"          on public.class_subjects        for select using (auth.uid() is not null);
create policy "read_auth_ta"          on public.teacher_assignments   for select using (auth.uid() is not null);
create policy "read_auth_ac"          on public.assessment_components for select using (auth.uid() is not null);
create policy "read_auth_gs"          on public.grading_schemes       for select using (auth.uid() is not null);
create policy "read_auth_gb"          on public.grade_bands           for select using (auth.uid() is not null);
create policy "read_auth_enrol"       on public.enrolments            for select using (auth.uid() is not null);
create policy "read_auth_fees"        on public.fee_structures        for select using (auth.uid() is not null);
create policy "read_auth_payments"    on public.payments              for select using (public.can_manage_academics());

-- Write: admins/principals/registrars
create policy "write_sessions"    on public.academic_sessions     for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_terms"       on public.terms                 for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_departments" on public.departments           for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_classes"     on public.classes               for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_arms"        on public.class_arms            for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_subjects"    on public.subjects              for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_cs"          on public.class_subjects        for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_ta"          on public.teacher_assignments   for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_ac"          on public.assessment_components for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_gs"          on public.grading_schemes       for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_gb"          on public.grade_bands           for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_enrol"       on public.enrolments            for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_fees"        on public.fee_structures        for all using (public.can_manage_academics()) with check (public.can_manage_academics());
create policy "write_payments"    on public.payments              for all using (public.can_manage_academics()) with check (public.can_manage_academics());