-- ─────────────────────────────────────────────────────────────
-- 0001_defaults.sql — Roles, permissions, system lists.
-- Idempotent: safe to run repeatedly.
-- ─────────────────────────────────────────────────────────────

-- ── Roles ────────────────────────────────────────────────────
insert into public.roles (key, name, description, is_system) values
  ('admin',         'Administrator',          'Full system access',                 true),
  ('principal',     'Principal',              'School leadership, approvals',       true),
  ('vice_principal','Vice Principal',         'Deputy leadership, oversight',       true),
  ('bursar',        'Bursar / Finance Officer','Finance and payments',              true),
  ('registrar',     'Registrar',              'Student records and admissions',     true),
  ('teacher',       'Teacher',                'Subject teacher access',             true),
  ('class_teacher', 'Class Teacher',          'Teacher with class oversight',       true),
  ('student',       'Student',                'Student portal access',              true),
  ('parent',        'Parent / Guardian',      'Parent portal access',               true)
on conflict (key) do update
  set name = excluded.name,
      description = excluded.description;

-- ── Permissions ──────────────────────────────────────────────
insert into public.permissions (key, description) values
  ('settings.manage',        'Manage school settings and branding'),
  ('users.manage',           'Manage user accounts and roles'),
  ('students.view',          'View student records'),
  ('students.create',        'Create student records'),
  ('students.edit',          'Edit student records'),
  ('students.delete',        'Archive or delete student records'),
  ('staff.view',             'View staff records'),
  ('staff.manage',           'Create/edit staff records'),
  ('parents.manage',         'Manage parents and links'),
  ('academics.manage',       'Manage sessions, terms, classes, subjects'),
  ('assignments.manage',     'Manage teacher assignments'),
  ('attendance.view',        'View attendance'),
  ('attendance.record',      'Record attendance'),
  ('results.enter',          'Enter scores'),
  ('results.submit',         'Submit scores for approval'),
  ('results.approve',        'Approve or return submitted results'),
  ('results.publish',        'Publish official results'),
  ('results.view',           'View results'),
  ('reportcard.generate',    'Generate report cards'),
  ('cbt.author',             'Author CBT questions and exams'),
  ('cbt.take',               'Take CBT exams'),
  ('fees.view',              'View fees and balances'),
  ('fees.record',            'Record manual payments'),
  ('admissions.review',      'Review and decide on applications'),
  ('library.manage',         'Manage books and loans'),
  ('inventory.manage',       'Manage assets and inventory'),
  ('transport.manage',       'Manage vehicles and routes'),
  ('content.manage',         'Manage website content'),
  ('audit.view',             'View audit trail'),
  ('system.configure',       'Manage system lists and lookups')
on conflict (key) do nothing;

-- ── Role → Permission matrix (defaults; editable from admin) ─
-- Admin gets everything
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'admin'
on conflict do nothing;

-- Principal: broad read + approvals + content, no user mgmt
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'students.view','staff.view','attendance.view',
  'results.view','results.approve','results.publish',
  'reportcard.generate','fees.view','admissions.review',
  'content.manage','audit.view','library.manage',
  'inventory.manage','transport.manage'
)
where r.key = 'principal'
on conflict do nothing;

-- Bursar: fees and finances only (no academic editing)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'students.view','fees.view','fees.record'
)
where r.key = 'bursar'
on conflict do nothing;

-- Registrar: student/staff records, admissions, academics
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'students.view','students.create','students.edit','students.delete',
  'staff.view','staff.manage','parents.manage',
  'academics.manage','assignments.manage',
  'attendance.view','results.view',
  'admissions.review','content.manage'
)
where r.key = 'registrar'
on conflict do nothing;

-- Teacher: view + enter/submit own results, take attendance
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'students.view','attendance.view','attendance.record',
  'results.view','results.enter','results.submit',
  'cbt.author'
)
where r.key = 'teacher'
on conflict do nothing;

-- Class teacher: teacher + report card viewing
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'students.view','attendance.view','attendance.record',
  'results.view','results.enter','results.submit',
  'reportcard.generate','cbt.author'
)
where r.key = 'class_teacher'
on conflict do nothing;

-- Student
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'results.view','cbt.take','fees.view'
)
where r.key = 'student'
on conflict do nothing;

-- Parent
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'results.view','fees.view'
)
where r.key = 'parent'
on conflict do nothing;

-- ── System lists (the "no hardcoding" backbone) ──────────────
insert into public.system_lists (list_key, item_key, item_label, sort_order, is_system) values
  -- Attendance statuses
  ('attendance_status','present','Present',1,true),
  ('attendance_status','absent','Absent',2,true),
  ('attendance_status','late','Late',3,true),
  ('attendance_status','excused','Excused',4,true),
  -- Gender
  ('gender','male','Male',1,true),
  ('gender','female','Female',2,true),
  -- Employment status
  ('employment_status','active','Active',1,true),
  ('employment_status','on_leave','On Leave',2,true),
  ('employment_status','suspended','Suspended',3,true),
  ('employment_status','resigned','Resigned',4,true),
  -- Student status
  ('student_status','active','Active',1,true),
  ('student_status','graduated','Graduated',2,true),
  ('student_status','withdrawn','Withdrawn',3,true),
  ('student_status','suspended','Suspended',4,true),
  ('student_status','archived','Archived',5,true),
  -- Enrolment status
  ('enrolment_status','enrolled','Enrolled',1,true),
  ('enrolment_status','promoted','Promoted',2,true),
  ('enrolment_status','repeated','Repeated',3,true),
  -- Result statuses
  ('result_status','draft','Draft',1,true),
  ('result_status','submitted','Submitted',2,true),
  ('result_status','approved','Approved',3,true),
  ('result_status','returned','Returned for correction',4,true),
  ('result_status','published','Published',5,true),
  -- Admission statuses
  ('admission_status','submitted','Submitted',1,true),
  ('admission_status','under_review','Under Review',2,true),
  ('admission_status','correction','Needs Correction',3,true),
  ('admission_status','approved','Approved',4,true),
  ('admission_status','rejected','Rejected',5,true),
  ('admission_status','enrolled','Enrolled',6,true),
  -- News categories
  ('news_category','general','General',1,false),
  ('news_category','achievement','Achievement',2,false),
  ('news_category','event','Event',3,false),
  ('news_category','academic','Academic',4,false),
  -- Gallery categories
  ('gallery_category','general','General',1,false),
  ('gallery_category','sports','Sports',2,false),
  ('gallery_category','academics','Academics',3,false),
  ('gallery_category','events','Events',4,false),
  -- Event types
  ('event_type','academic','Academic',1,false),
  ('event_type','sports','Sports',2,false),
  ('event_type','cultural','Cultural',3,false),
  ('event_type','meeting','Meeting',4,false),
  ('event_type','holiday','Holiday',5,false),
  -- Download categories
  ('download_category','prospectus','Prospectus',1,false),
  ('download_category','admission','Admission Forms',2,false),
  ('download_category','policy','Policies',3,false),
  ('download_category','other','Other',4,false),
  -- Relationship types (parent → student)
  ('relationship','father','Father',1,true),
  ('relationship','mother','Mother',2,true),
  ('relationship','guardian','Guardian',3,true),
  ('relationship','other','Other',4,true),
  -- CBT question types
  ('question_type','objective','Objective',1,true),
  ('question_type','theory','Theory',2,true),
  ('question_type','multi_answer','Multiple Answer',3,true),
  -- CBT difficulty
  ('question_difficulty','easy','Easy',1,false),
  ('question_difficulty','medium','Medium',2,false),
  ('question_difficulty','hard','Hard',3,false),
  -- Book categories
  ('book_category','textbook','Textbook',1,false),
  ('book_category','fiction','Fiction',2,false),
  ('book_category','reference','Reference',3,false),
  ('book_category','journal','Journal',4,false),
  -- Asset categories
  ('asset_category','furniture','Furniture',1,false),
  ('asset_category','electronics','Electronics',2,false),
  ('asset_category','lab','Laboratory',3,false),
  ('asset_category','sports','Sports Equipment',4,false),
  ('asset_category','vehicle','Vehicle',5,false),
  -- Asset condition
  ('asset_condition','new','New',1,false),
  ('asset_condition','good','Good',2,false),
  ('asset_condition','fair','Fair',3,false),
  ('asset_condition','poor','Poor',4,false),
  ('asset_condition','damaged','Damaged',5,false),
  -- Vehicle status
  ('vehicle_status','active','Active',1,false),
  ('vehicle_status','maintenance','Under Maintenance',2,false),
  ('vehicle_status','retired','Retired',3,false),
  -- Loan status
  ('loan_status','borrowed','Borrowed',1,true),
  ('loan_status','returned','Returned',2,true),
  ('loan_status','overdue','Overdue',3,true),
  ('loan_status','lost','Lost',4,true)
on conflict (list_key, item_key) do update
  set item_label = excluded.item_label,
      sort_order = excluded.sort_order;