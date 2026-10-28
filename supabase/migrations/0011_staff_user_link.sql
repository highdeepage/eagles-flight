-- ─────────────────────────────────────────────────────────────
-- 0011_staff_user_link.sql
-- Helper to check if current user has a staff record (teacher role).
-- ─────────────────────────────────────────────────────────────

create or replace function public.my_staff_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.staff where user_id = auth.uid() limit 1;
$$;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.users where id = auth.uid())
    in ('teacher','class_teacher'),
    false
  );
$$;