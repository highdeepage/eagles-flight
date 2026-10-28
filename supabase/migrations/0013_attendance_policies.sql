alter table public.attendance_records enable row level security;

-- Helpers
create or replace function public.teaches_arm(arm_id uuid, term uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.teacher_assignments ta
    where ta.class_arm_id = arm_id
      and ta.term_id = term
      and ta.staff_id = public.my_staff_id()
  );
$$;

create or replace function public.is_own_class_arm(arm_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_arms ca
    where ca.id = arm_id and ca.class_teacher_id = auth.uid()
  );
$$;

-- Read: admins, class teachers of the arm, teachers assigned to the arm, students, parents
create policy "att_read_admin" on public.attendance_records
  for select using (public.can_manage_people());

create policy "att_read_teacher" on public.attendance_records
  for select using (public.teaches_arm(class_arm_id, term_id) or public.is_own_class_arm(class_arm_id));

create policy "att_read_student" on public.attendance_records
  for select using (student_id = public.my_student_id());

create policy "att_read_parent" on public.attendance_records
  for select using (
    exists (
      select 1 from public.parent_student ps
      join public.parents p on p.id = ps.parent_id
      where ps.student_id = attendance_records.student_id and p.user_id = auth.uid()
    )
  );

-- Write: admins + class teacher of that arm + teachers assigned to the arm
create policy "att_write_admin" on public.attendance_records
  for all using (public.can_manage_people()) with check (public.can_manage_people());

create policy "att_write_teacher" on public.attendance_records
  for all using (public.is_own_class_arm(class_arm_id) or public.teaches_arm(class_arm_id, term_id))
  with check (public.is_own_class_arm(class_arm_id) or public.teaches_arm(class_arm_id, term_id));