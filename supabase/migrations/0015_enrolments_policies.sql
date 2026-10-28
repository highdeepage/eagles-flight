-- ─────────────────────────────────────────────────────────────
-- 0015_enrolments_policies.sql
-- RLS for enrolments (table exists from 0005).
-- ─────────────────────────────────────────────────────────────

alter table public.enrolments enable row level security;

-- Read: admins, teachers in the arm, the student themselves, their parents
create policy "enrol_read_admin" on public.enrolments
  for select using (public.can_manage_people());

create policy "enrol_read_teacher" on public.enrolments
  for select using (public.teaches_arm(class_arm_id, term_id) or public.is_own_class_arm(class_arm_id));

create policy "enrol_read_student" on public.enrolments
  for select using (student_id = public.my_student_id());

create policy "enrol_read_parent" on public.enrolments
  for select using (
    exists (
      select 1 from public.parent_student ps
      join public.parents p on p.id = ps.parent_id
      where ps.student_id = enrolments.student_id and p.user_id = auth.uid()
    )
  );

-- Write: admins only (registrar role included via can_manage_people)
create policy "enrol_write" on public.enrolments
  for all using (public.can_manage_people()) with check (public.can_manage_people());