-- READ-ONLY verification for the DEPLOYED Supabase project (P0-1).
-- Paste into Supabase Dashboard > SQL Editor. Nothing here changes data: the write probes run inside a
-- transaction that is rolled back. Expected results are in the comments.

-- 1) RLS must be enabled on both tables (expect rls_enabled = true for both rows)
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('projects', 'admin_users');

-- 2) Policies actually present (expect 1 on admin_users, 5 on projects; no policy with using (true) for writes)
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies where schemaname = 'public' and tablename in ('projects', 'admin_users')
order by tablename, cmd, policyname;

-- 3) Who is an admin (expect only your own user id(s))
select au.user_id, u.email from public.admin_users au join auth.users u on u.id = au.user_id;

-- 4) Anonymous write probes — each must FAIL with a row-level-security / permission error.
--    The whole block is rolled back, so nothing is stored even if a probe unexpectedly succeeds.
begin;
set local role anon;
insert into public.projects (title, category) values ('__rls_probe__', 'branding');
rollback;

begin;
set local role anon;
select count(*) as anon_can_see_drafts from public.projects where is_published = false;  -- expect 0
select count(*) as anon_can_see_admins from public.admin_users;                         -- expect 0
rollback;

-- 5) Not SQL, but check in Dashboard > Authentication: public sign-ups disabled (unless intended),
--    and Auth > URL configuration lists only your real site URL(s).
