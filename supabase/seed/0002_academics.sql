-- ─────────────────────────────────────────────────────────────
-- 0002_academics.sql
-- Default academic structure. All editable in admin.
-- ─────────────────────────────────────────────────────────────

-- Current session
insert into public.academic_sessions (name, start_date, end_date, is_current)
values ('2025/2026', '2025-09-01', '2026-07-31', true)
on conflict (name) do nothing;

-- Three terms for current session
insert into public.terms (session_id, name, start_date, end_date, is_current, sort_order)
select s.id, t.name, t.start_date::date, t.end_date::date, t.is_current, t.sort_order
from public.academic_sessions s
cross join (values
  ('Term 1', '2025-09-01', '2025-12-15', true,  1),
  ('Term 2', '2026-01-10', '2026-04-05', false, 2),
  ('Term 3', '2026-04-20', '2026-07-31', false, 3)
) as t(name, start_date, end_date, is_current, sort_order)
where s.name = '2025/2026'
on conflict (session_id, name) do nothing;

-- Departments
insert into public.departments (name) values
  ('Sciences'), ('Arts & Humanities'), ('Languages'), ('Commercial')
on conflict (name) do nothing;

-- Classes
insert into public.classes (name, level, description) values
  ('SSS 1', 1, 'Senior Secondary 1'),
  ('SSS 2', 2, 'Senior Secondary 2'),
  ('SSS 3', 3, 'Senior Secondary 3')
on conflict (name) do nothing;

-- Class arms
insert into public.class_arms (class_id, arm_name)
select c.id, a.arm
from public.classes c
cross join (values ('A'), ('B'), ('C')) as a(arm)
where c.name in ('SSS 1','SSS 2','SSS 3')
on conflict (class_id, arm_name) do nothing;

-- Subjects (editable in admin)
insert into public.subjects (name, code, department_id) values
  ('Mathematics',            'MTH', (select id from public.departments where name='Sciences')),
  ('English Language',       'ENG', (select id from public.departments where name='Languages')),
  ('Physics',                'PHY', (select id from public.departments where name='Sciences')),
  ('Chemistry',              'CHM', (select id from public.departments where name='Sciences')),
  ('Biology',                'BIO', (select id from public.departments where name='Sciences')),
  ('Further Mathematics',    'FMT', (select id from public.departments where name='Sciences')),
  ('Economics',              'ECO', (select id from public.departments where name='Commercial')),
  ('Government',             'GOV', (select id from public.departments where name='Arts & Humanities')),
  ('Literature in English',  'LIT', (select id from public.departments where name='Languages')),
  ('Christian Religious Studies', 'CRS', (select id from public.departments where name='Arts & Humanities')),
  ('Agricultural Science',   'AGR', (select id from public.departments where name='Sciences')),
  ('Civic Education',        'CIV', (select id from public.departments where name='Arts & Humanities'))
on conflict (code) do nothing;

-- Attach all subjects to all classes (editable later)
insert into public.class_subjects (class_id, subject_id)
select c.id, s.id from public.classes c cross join public.subjects s
where c.name in ('SSS 1','SSS 2','SSS 3')
on conflict do nothing;

-- Assessment components per term (default CA=40, Exam=60)
insert into public.assessment_components (term_id, name, weight, sort_order)
select t.id, comp.name, comp.weight, comp.sort_order
from public.terms t
cross join (values
  ('CA',   40, 1),
  ('Exam', 60, 2)
) as comp(name, weight, sort_order)
on conflict (term_id, name) do nothing;

-- Default grading scheme
insert into public.grading_schemes (name, is_default)
values ('Standard A-F', true)
on conflict (name) do nothing;

insert into public.grade_bands (scheme_id, grade, min_score, max_score, remark, sort_order)
select g.id, b.grade, b.min_score, b.max_score, b.remark, b.sort_order
from public.grading_schemes g
cross join (values
  ('A', 70, 100, 'Excellent',   1),
  ('B', 60,  69, 'Very Good',   2),
  ('C', 50,  59, 'Good',        3),
  ('D', 45,  49, 'Fair',        4),
  ('E', 40,  44, 'Pass',        5),
  ('F',  0,  39, 'Fail',        6)
) as b(grade, min_score, max_score, remark, sort_order)
where g.name = 'Standard A-F'
on conflict (scheme_id, grade) do nothing;