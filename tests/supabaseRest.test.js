import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const URL_BASE = "https://example.supabase.co";

async function load(env = { VITE_SUPABASE_URL: URL_BASE, VITE_SUPABASE_ANON_KEY: "anon-key" }) {
  vi.resetModules();
  vi.stubEnv("VITE_SUPABASE_URL", env.VITE_SUPABASE_URL ?? "");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", env.VITE_SUPABASE_ANON_KEY ?? "");
  return import("../src/lib/supabaseRest.js");
}

function json(body, status = 200) {
  return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
}

let fetchMock;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const validProject = { title: "  Demo  ", category: "motion-design", description: "d", year: "2026", is_published: true };

describe("configuration", () => {
  it("reports unconfigured and returns no projects without calling the network", async () => {
    const api = await load({});
    expect(api.isSupabaseConfigured()).toBe(false);
    await expect(api.getPublishedProjects("motion-graphics")).resolves.toEqual([]);
    await expect(api.signIn("a@b.co", "pw")).rejects.toThrow(/not configured/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("public reads", () => {
  it("requests only published rows, filtered by category, with the anon key and no bearer token", async () => {
    const api = await load();
    fetchMock.mockReturnValue(json([{ id: "1" }]));
    await api.getPublishedProjects("motion-design");
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain(`${URL_BASE}/rest/v1/projects?`);
    expect(url).toContain("is_published=eq.true");
    expect(url).toContain("category=eq.motion-design");
    expect(opts.headers.apikey).toBe("anon-key");
    expect(opts.headers.Authorization).toBeUndefined();
  });
});

describe("authentication", () => {
  it("stores the session in sessionStorage on sign-in", async () => {
    const api = await load();
    fetchMock.mockReturnValue(json({ access_token: "at", refresh_token: "rt", expires_in: 3600, user: { id: "u1" } }));
    const session = await api.signIn("a@b.co", "pw");
    expect(session.access_token).toBe("at");
    expect(api.getSession().refresh_token).toBe("rt");
    expect(fetchMock.mock.calls[0][0]).toContain("grant_type=password");
  });

  it("surfaces the server message when sign-in fails and stores nothing", async () => {
    const api = await load();
    fetchMock.mockReturnValue(json({ msg: "Invalid login credentials" }, 400));
    await expect(api.signIn("a@b.co", "bad")).rejects.toThrow("Invalid login credentials");
    expect(api.getSession()).toBeNull();
  });

  it("signOut clears the session", async () => {
    const api = await load();
    sessionStorage.setItem("cco_admin_session", JSON.stringify({ access_token: "at", expires_at: Date.now() + 1e6 }));
    fetchMock.mockReturnValue(json(null, 204));
    api.signOut();
    expect(api.getSession()).toBeNull();
  });
});

describe("admin access", () => {
  const live = { access_token: "at", refresh_token: "rt", expires_at: Date.now() + 3600_000 };

  it("rejects a signed-in non-admin and never requests the projects table", async () => {
    const api = await load();
    sessionStorage.setItem("cco_admin_session", JSON.stringify(live));
    fetchMock.mockReturnValue(json([]));
    await expect(api.getAdminProjects()).rejects.toThrow(/not authorized/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("/rest/v1/admin_users");
  });

  it("sends the bearer token and loads all projects for an admin", async () => {
    const api = await load();
    sessionStorage.setItem("cco_admin_session", JSON.stringify(live));
    fetchMock.mockReturnValueOnce(json([{ user_id: "u1" }])).mockReturnValueOnce(json([{ id: "p1" }]));
    await expect(api.getAdminProjects()).resolves.toEqual([{ id: "p1" }]);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer at");
  });

  it("refreshes an expiring session before calling the API", async () => {
    const api = await load();
    sessionStorage.setItem("cco_admin_session", JSON.stringify({ ...live, expires_at: Date.now() + 1000 }));
    fetchMock
      .mockReturnValueOnce(json({ access_token: "new", refresh_token: "rt2", expires_in: 3600 }))
      .mockReturnValueOnce(json([{ user_id: "u1" }]))
      .mockReturnValueOnce(json([]));
    await api.getAdminProjects();
    expect(fetchMock.mock.calls[0][0]).toContain("grant_type=refresh_token");
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer new");
  });

  it("clears the session when the API answers 401", async () => {
    const api = await load();
    sessionStorage.setItem("cco_admin_session", JSON.stringify(live));
    fetchMock.mockReturnValueOnce(json({ message: "JWT expired" }, 401)).mockReturnValue(json(null, 204));
    await expect(api.getAdminProjects()).rejects.toThrow("JWT expired");
    expect(api.getSession()).toBeNull();
  });
});

describe("saveProject / deleteProject", () => {
  const live = { access_token: "at", refresh_token: "rt", expires_at: Date.now() + 3600_000 };
  beforeEach(() => sessionStorage.setItem("cco_admin_session", JSON.stringify(live)));

  it("POSTs a normalised payload for a new project", async () => {
    const api = await load();
    fetchMock.mockReturnValue(json([{ id: "n" }]));
    await api.saveProject({ ...validProject, project_url: "https://example.com/x", cover_image: "" });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${URL_BASE}/rest/v1/projects`);
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toMatchObject({ title: "Demo", cover_image: null, project_url: "https://example.com/x", year: "2026" });
    expect(JSON.parse(opts.body).category).toBe("motion-graphics");
  });

  it("PATCHes by id when editing", async () => {
    const api = await load();
    fetchMock.mockReturnValue(json([{ id: "p1" }]));
    await api.saveProject({ ...validProject, id: "p1" });
    expect(fetchMock.mock.calls[0][0]).toContain("/rest/v1/projects?id=eq.p1");
    expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");
  });

  it.each([
    ["javascript: URL", { project_url: "javascript:alert(1)" }],
    ["plain http URL", { github_url: "http://github.com/x" }],
    ["data: URL", { cover_image: "data:text/html,<script>1</script>" }],
    ["bad year", { year: "20x6" }],
    ["unknown category", { category: "other" }],
    ["empty title", { title: "   " }],
  ])("rejects %s before any network call", async (_label, patch) => {
    const api = await load();
    await expect(api.saveProject({ ...validProject, ...patch })).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("DELETEs by id", async () => {
    const api = await load();
    fetchMock.mockReturnValue(json(null, 204));
    await api.deleteProject("p1");
    expect(fetchMock.mock.calls[0][0]).toContain("id=eq.p1");
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
  });
});
