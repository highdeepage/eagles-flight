alter table public.result_records     enable row level security;
alter table public.result_submissions enable row level security;

-- Helpers
create or replace function public.teaches_enrolment(enrol_id uuid, subject uuid, term uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.enrolments e
    join public.teacher_assignments ta on ta.class_arm_id = e.class_arm_id and ta.term_id = e.term_id
    where e.id = enrol_id and ta.subject_id = subject and ta.staff_id = public.my_staff_id()
  );
$$;

-- result_records
create policy "rr_read_admin" on public.result_records
  for select using (public.can_manage_people());

create policy "rr_read_teacher" on public.result_records
  for select using (
    exists (
      select 1 from public.enrolments e
      where e.id = result_records.enrolment_id
        and public.teaches_arm(e.class_arm_id, e.term_id)
    )
  );

create policy "rr_read_student" on public.result_records
  for select using (
    exists (
      select 1 from public.enrolments e
      join public.result_submissions rs on rs.enrolment_id = e.id and rs.subject_id = result_records.subject_id
      where e.id = result_records.enrolment_id
        and e.student_id = public.my_student_id()
        and rs.status = 'published'
    )
  );

create policy "rr_read_parent" on public.result_records
  for select using (
    exists (
      select 1 from public.enrolments e
      join public.result_submissions rs on rs.enrolment_id = e.id and rs.subject_id = result_records.subject_id
      join public.parent_student ps on ps.student_id = e.student_id
      join public.parents p on p.id = ps.parent_id
      where e.id = result_records.enrolment_id
        and p.user_id = auth.uid()
        and rs.status = 'published'
    )
  );

create policy "rr_write_admin" on public.result_records
  for all using (public.can_manage_people()) with check (public.can_manage_people());

create policy "rr_write_teacher" on public.result_records
  for all using (
    exists (
      select 1 from public.enrolments e
      where e.id = result_records.enrolment_id
        and public.teaches_arm(e.class_arm_id, e.term_id)
    )
  ) with check (
    exists (
      select 1 from public.enrolments e
      where e.id = result_records.enrolment_id
        and public.teaches_arm(e.class_arm_id, e.term_id)
    )
  );

-- result_submissions
create policy "rs_read_admin" on public.result_submissions
  for select using (public.can_manage_people());

create policy "rs_read_teacher" on public.result_submissions
  for select using (
    exists (
      select 1 from public.enrolments e
      where e.id = result_submissions.enrolment_id
        and public.teaches_arm(e.class_arm_id, e.term_id)
    )
  );

create policy "rs_read_student" on public.result_submissions
  for select using (
    exists (
      select 1 from public.enrolments e
      where e.id = result_submissions.enrolment_id
        and e.student_id = public.my_student_id()
    )
  );

create policy "rs_read_parent" on public.result_submissions
  for select using (
    exists (
      select 1 from public.enrolments e
      join public.parent_student ps on ps.student_id = e.student_id
      join public.parents p on p.id = ps.parent_id
      where e.id = result_submissions.enrolment_id
        and p.user_id = auth.uid()
    )
  );

create policy "rs_write_admin" on public.result_submissions
  for all using (public.can_manage_people()) with check (public.can_manage_people());

create policy "rs_write_teacher" on public.result_submissions
  for all using (
    exists (
      select 1 from public.enrolments e
      where e.id = result_submissions.enrolment_id
        and public.teaches_arm(e.class_arm_id, e.term_id)
    )
  ) with check (
    exists (
      select 1 from public.enrolments e
      where e.id = result_submissions.enrolment_id
        and public.teaches_arm(e.class_arm_id, e.term_id)
    )
  );