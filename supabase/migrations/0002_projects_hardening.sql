-- 0002 — projects hardening (additive; safe to re-run).
-- 1) keep updated_at truthful, 2) enforce https-only URLs and 4-digit years at the database level.
-- Constraints are added NOT VALID so existing rows never block the migration; they are enforced for
-- every new insert/update. Clean up any old rows, then run the VALIDATE statements at the bottom.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects drop constraint if exists projects_urls_https_chk;
alter table public.projects add constraint projects_urls_https_chk check (
  (cover_image is null or cover_image ~* '^https://[^[:space:]]+$')
  and (project_url is null or project_url ~* '^https://[^[:space:]]+$')
  and (github_url  is null or github_url  ~* '^https://[^[:space:]]+$')
  and (video_url   is null or video_url   ~* '^https://[^[:space:]]+$')
) not valid;

alter table public.projects drop constraint if exists projects_year_format_chk;
alter table public.projects add constraint projects_year_format_chk
  check (year is null or year ~ '^[0-9]{4}$') not valid;

-- Find rows that would fail validation (should return zero rows before you validate):
--   select id, title from public.projects
--   where not ( (cover_image is null or cover_image ~* '^https://[^[:space:]]+$')
--           and (project_url is null or project_url ~* '^https://[^[:space:]]+$')
--           and (github_url  is null or github_url  ~* '^https://[^[:space:]]+$')
--           and (video_url   is null or video_url   ~* '^https://[^[:space:]]+$')
--           and (year is null or year ~ '^[0-9]{4}$') );
-- Then:
--   alter table public.projects validate constraint projects_urls_https_chk;
--   alter table public.projects validate constraint projects_year_format_chk;
