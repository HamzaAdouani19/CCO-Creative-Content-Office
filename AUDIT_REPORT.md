# CCO implementation notes

The project was expanded from the original React/Vite/GSAP branding landing page.

## Implemented in this package
- Retained the original branding landing page and case studies.
- Added `/branding`, `/motion`, `/development`, and `/admin` route handling.
- Added responsive category portfolio pages for Motion & Video and Development.
- Added an admin UI for creating, editing, publishing/unpublishing, and deleting projects across three categories.
- Added Supabase Auth REST calls, session refresh handling, and a PostgreSQL schema with Row Level Security policies in `supabase/schema.sql`.
- Added `.env.example`, deployment rewrites for Vercel, and setup documentation.
- Normalized ALKIF asset import casing for case-sensitive build environments.
- Updated site metadata and CCO footer/brand references.

## Required before production
- Create/configure a Supabase project and run `supabase/schema.sql`.
- Create an admin user in Supabase Auth and add its UUID to `public.admin_users`.
- Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and the real `VITE_CONTACT_EMAIL` in local and deployment environment settings.
- Test RLS using both an admin account and a normal non-admin account.
- Connect a server-side form provider if enquiries must be received reliably; the current contact form opens the visitor's email app.
- Configure image hosting and only publish media you have permission to use.

## Verification status
JS/JSX files were parsed successfully with Babel's parser. A production build could not be completed in this Linux workspace because the archive's `node_modules` came from a different platform and the Linux Rollup optional binary was unavailable; npm registry access timed out. Remove `node_modules` and run `npm install` on the target machine before building. Do not treat this as a confirmed successful production build.
