-- 0003 — expand project categories and migrate legacy slugs without changing project IDs.
-- Safe to re-run. Apply this migration before deploying the six-category frontend.

alter table public.projects drop constraint if exists projects_category_check;
alter table public.projects drop constraint if exists projects_category_slug_chk;

update public.projects
set category = case category
  when 'motion' then 'motion-graphics'
  when 'development' then 'web-development'
  else category
end
where category in ('motion', 'development');

alter table public.projects
  add constraint projects_category_slug_chk
  check (category in (
    'branding', 'social-media', 'web-development',
    'motion-graphics', 'video-production', 'photography'
  )) not valid;

alter table public.projects
  validate constraint projects_category_slug_chk;
