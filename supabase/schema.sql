-- CCO project CMS — run in the Supabase SQL Editor.
-- Create the admin user in Supabase Dashboard > Authentication > Users first.
-- Never put a service_role key in the frontend.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title varchar(120) not null,
  category text not null check (category in ('branding', 'motion', 'development')),
  description varchar(600) not null default '',
  cover_image text,
  project_url text,
  github_url text,
  video_url text,
  year varchar(4),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_category_created_idx
  on public.projects (category, is_published, created_at desc);

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;

drop policy if exists "Admins can read their own admin record" on public.admin_users;
create policy "Admins can read their own admin record"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Anyone can read published projects" on public.projects;
create policy "Anyone can read published projects"
  on public.projects for select to anon, authenticated
  using (is_published = true);

drop policy if exists "Admins can read all projects" on public.projects;
create policy "Admins can read all projects"
  on public.projects for select to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));

drop policy if exists "Admins can insert projects" on public.projects;
create policy "Admins can insert projects"
  on public.projects for insert to authenticated
  with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));

drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
  on public.projects for update to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));

drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects"
  on public.projects for delete to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));

-- After creating your admin user in Authentication > Users, replace UUID below:
-- insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');
