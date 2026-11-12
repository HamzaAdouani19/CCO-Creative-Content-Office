# CCO — Creative Content Office

A React + Vite creative portfolio with six category routes and a private project-management workspace.

## Stack
- React 18 + Vite 6
- GSAP + ScrollTrigger (existing branding experience retained)
- Supabase Auth + PostgREST through browser-safe public credentials
- PostgreSQL Row Level Security (RLS) policies in `supabase/schema.sql`

## Local development
1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings.
4. Run `npm install`, then `npm run dev`.

Routes:
- `/branding` — current branding site and case studies
- `/social-media` — published social media projects
- `/web-development` — published web design and development projects (`/development` remains an alias)
- `/motion-graphics` — published motion graphics projects (`/motion` remains an alias)
- `/video-production` — published video production projects
- `/photography` — published photography projects
- `/admin` — private CMS login and project management

The shared category configuration lives in `src/config/projectCategories.js`; each public listing and the admin category selector uses the same category slugs.

## Configure the database and admin securely
1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
   - For an existing installation, apply `supabase/migrations/0003_project_categories.sql` before deploying the updated frontend. It maps `motion` to `motion-graphics` and `development` to `web-development` without changing project IDs or other fields.
   - The migration updates only the two legacy category values and enforces the six canonical slugs. No manual cleanup is required for those existing values.
3. In Supabase Authentication settings, disable public sign-ups if you do not need them. Create your admin user yourself from the dashboard.
4. Copy that user's UUID from Authentication > Users and run:
   ```sql
   insert into public.admin_users (user_id)
   values ('YOUR-AUTH-USER-UUID');
   ```
5. Set the two `VITE_...` values in `.env.local` and in your hosting provider's environment settings, then redeploy.
6. Test with an ordinary non-admin account: it must not be able to create, update, or delete projects.

## Security notes
- The frontend uses only the Supabase publishable/anon key. This key is not a secret; RLS is the security boundary.
- **Never** use `service_role` or other privileged secrets in `VITE_` variables or browser code.
- The database allows public reads only for `is_published = true`. Insert/update/delete operations require a row in `public.admin_users` matching the authenticated user's UUID.
- The admin route is not considered secure merely because it is at `/admin`; the SQL policies enforce the permissions.
- Browser sessions use `sessionStorage` and short-lived access tokens with refresh handling. As with any browser app, an XSS flaw could expose a session, so keep dependencies updated and never render user-provided HTML.
- Public portfolio routes use database content once Supabase is configured. Branding's existing case studies are retained as the current static portfolio; newly CMS-managed branding projects are stored in the CMS, while the existing case studies remain part of the original page.
- Contact form currently opens the visitor's email app. It is not a server-side form processor and should not be described as secure lead capture until a backend/email service and spam protection are connected.

## Tests and quality checks
```bash
npm test        # Vitest: REST client, validation, public pages, and database RLS/migration tests (PGlite)
npm run lint    # ESLint
```
- `tests/rls.test.js` runs `supabase/schema.sql` and `supabase/migrations/*.sql` on an in-process Postgres and checks what anonymous visitors, ordinary signed-in users and admins can do. It validates the SQL files, not your deployed project.
- To verify the **deployed** Supabase project, paste `supabase/verify/rls_checks.sql` into the SQL Editor (read-only; write probes are rolled back).
- After `schema.sql`, apply migrations in `supabase/migrations/` in order.

## Build
```bash
npm run build
npm run preview
```

For production deployment, configure the host to serve the Vite SPA fallback for all category routes and `/admin`. Vercel rewrites are defined in `vercel.json`; retain equivalent rewrites if using another host.
