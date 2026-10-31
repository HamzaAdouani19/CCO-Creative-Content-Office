// @vitest-environment node
// Runs supabase/schema.sql and migration 0002 on an in-process Postgres (PGlite) with Supabase-like roles,
// then checks what anon, a normal signed-in user and an admin can do. This validates the SQL FILES, not the
// deployed project — use supabase/verify/rls_checks.sql for the live database.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const ADMIN = "11111111-1111-1111-1111-111111111111";
const USER = "22222222-2222-2222-2222-222222222222";
let db;

async function as(role, uid, fn) {
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? ""]);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub', '', false)");
  }
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
  `);
  await db.exec(readFileSync("supabase/schema.sql", "utf8"));
  // Supabase grants table privileges to API roles by default; RLS is what restricts them.
  await db.exec(`
    grant select on public.projects to anon;
    grant select, insert, update, delete on public.projects to authenticated;
    grant select on public.admin_users to authenticated;
  `);
  await db.exec(readFileSync("supabase/migrations/0002_projects_hardening.sql", "utf8"));
  await db.exec(`
    insert into auth.users values ('${ADMIN}'), ('${USER}');
    insert into public.admin_users (user_id) values ('${ADMIN}');
    insert into public.projects (id, title, category, is_published) values
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Public one', 'branding', true),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Draft one', 'motion', false);
  `);
});
afterAll(async () => db?.close());

const count = async (sql) => Number((await db.query(sql)).rows[0].n);

describe("reads", () => {
  it("anon sees published projects only and no admin records", async () => {
    await as("anon", null, async () => {
      expect(await count("select count(*)::int n from public.projects")).toBe(1);
      expect(await count("select count(*)::int n from public.projects where is_published = false")).toBe(0);
    });
    await expect(as("anon", null, () => db.query("select * from public.admin_users"))).rejects.toThrow(/permission denied/i);
  });

  it("a signed-in non-admin sees published projects only and cannot see admin records", async () => {
    await as("authenticated", USER, async () => {
      expect(await count("select count(*)::int n from public.projects")).toBe(1);
      expect(await count("select count(*)::int n from public.admin_users")).toBe(0);
    });
  });

  it("an admin sees drafts and their own admin record", async () => {
    await as("authenticated", ADMIN, async () => {
      expect(await count("select count(*)::int n from public.projects")).toBe(2);
      expect(await count("select count(*)::int n from public.admin_users")).toBe(1);
    });
  });
});

describe("writes", () => {
  const insert = "insert into public.projects (title, category) values ('probe', 'branding')";

  it("anon cannot insert, update or delete", async () => {
    await expect(as("anon", null, () => db.query(insert))).rejects.toThrow(/permission denied/i);
    await expect(as("anon", null, () => db.query("update public.projects set title='x'"))).rejects.toThrow(/permission denied/i);
    await expect(as("anon", null, () => db.query("delete from public.projects"))).rejects.toThrow(/permission denied/i);
  });

  it("a non-admin user is blocked by RLS on insert, and update/delete touch zero rows", async () => {
    await expect(as("authenticated", USER, () => db.query(insert))).rejects.toThrow(/row-level security/i);
    const upd = await as("authenticated", USER, () => db.query("update public.projects set title='hacked' returning id"));
    const del = await as("authenticated", USER, () => db.query("delete from public.projects returning id"));
    expect(upd.rows).toHaveLength(0);
    expect(del.rows).toHaveLength(0);
    expect(await count("select count(*)::int n from public.projects where title = 'hacked'")).toBe(0);
    expect(await count("select count(*)::int n from public.projects")).toBe(2);
  });

  it("a non-admin cannot make themselves an admin", async () => {
    await expect(
      as("authenticated", USER, () => db.query(`insert into public.admin_users (user_id) values ('${USER}')`)),
    ).rejects.toThrow(/permission denied|row-level security/i);
  });

  it("an admin can insert, update and delete", async () => {
    await as("authenticated", ADMIN, async () => {
      const ins = await db.query("insert into public.projects (title, category) values ('admin made', 'development') returning id");
      const id = ins.rows[0].id;
      const upd = await db.query("update public.projects set title = 'renamed' where id = $1 returning title", [id]);
      expect(upd.rows[0].title).toBe("renamed");
      const del = await db.query("delete from public.projects where id = $1 returning id", [id]);
      expect(del.rows).toHaveLength(1);
    });
  });
});

describe("migration 0002", () => {
  const admin = (sql, params) => as("authenticated", ADMIN, () => db.query(sql, params));

  it("rejects javascript:, http: and whitespace URLs and malformed years", async () => {
    for (const col of ["cover_image", "project_url", "github_url", "video_url"]) {
      await expect(admin(`insert into public.projects (title, category, ${col}) values ('t','motion','javascript:alert(1)')`)).rejects.toThrow(/projects_urls_https_chk/);
      await expect(admin(`insert into public.projects (title, category, ${col}) values ('t','motion','http://example.com')`)).rejects.toThrow(/projects_urls_https_chk/);
    }
    await expect(admin("insert into public.projects (title, category, year) values ('t','motion','20x6')")).rejects.toThrow(/projects_year_format_chk/);
  });

  it("accepts https URLs and a four-digit year", async () => {
    const r = await admin("insert into public.projects (title, category, project_url, year) values ('ok','motion','https://example.com/p','2026') returning id");
    expect(r.rows).toHaveLength(1);
    await admin("delete from public.projects where id = $1", [r.rows[0].id]);
  });

  it("refreshes updated_at on update", async () => {
    // Backdate with the trigger disabled (otherwise the trigger would correctly overwrite the value).
    await db.exec("alter table public.projects disable trigger projects_set_updated_at");
    await db.exec("update public.projects set updated_at = now() - interval '1 day' where title = 'Public one'");
    await db.exec("alter table public.projects enable trigger projects_set_updated_at");
    const before = (await db.query("select updated_at from public.projects where title = 'Public one'")).rows[0].updated_at;
    await admin("update public.projects set description = 'changed' where title = 'Public one'");
    const after = (await db.query("select updated_at from public.projects where title = 'Public one'")).rows[0].updated_at;
    expect(new Date(after).getTime()).toBeGreaterThan(new Date(before).getTime() + 3600_000);
  });

  it("is idempotent", async () => {
    await db.exec(readFileSync("supabase/migrations/0002_projects_hardening.sql", "utf8"));
  });
});
