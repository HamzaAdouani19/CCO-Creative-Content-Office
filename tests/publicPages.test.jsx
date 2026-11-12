import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const rows = [
  { id: "1", title: "Safe project", category: "web-development", description: "ok", project_url: "https://example.com/live", github_url: "https://github.com/x/y", video_url: null, cover_image: null, year: "2026" },
  { id: "2", title: "Unsafe project", category: "web-development", description: "bad", project_url: "javascript:alert(1)", github_url: "http://insecure.example", video_url: null, cover_image: null, year: "2025" },
];

async function renderAt(path) {
  window.history.pushState({}, "", path);
  vi.resetModules();
  vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key");
  const { default: App } = await import("../src/App.jsx");
  return render(<App />);
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(rows) })));
});
afterEach(() => {
  sessionStorage.removeItem("cco_admin_session");
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("about and service routes", () => {
  it("renders the About page at /", async () => {
    await renderAt("/");
    expect(screen.getByRole("heading", { name: /ideas deserve/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  });

  it("/branding keeps the existing branding portfolio", async () => {
    await renderAt("/branding");
    expect(screen.getByRole("heading", { name: /from ideas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Brand Strategy & Visual Identity" })).toHaveAttribute("aria-current", "page");
  });

  it("renders published projects and only exposes https links", async () => {
    await renderAt("/digital-experience");
    await waitFor(() => expect(screen.getByText("Safe project")).toBeInTheDocument());
    const live = screen.getByRole("link", { name: /view project/i });
    expect(live).toHaveAttribute("href", "https://example.com/live");
    expect(live).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs.some((href) => href?.startsWith("javascript:"))).toBe(false);
    expect(hrefs).not.toContain("http://insecure.example");
  });

  it("loads projects stored under a legacy database category", async () => {
    await renderAt("/digital-experience");
    await waitFor(() => expect(screen.getByText("Safe project")).toBeInTheDocument());
    expect(globalThis.fetch.mock.calls.map(([url]) => url).join("\n")).toContain("category=eq.web-development");
  });

  it.each([
    ["/development", "/digital-experience", "Programming & Digital Experience"],
    ["/motion", "/motion-design", "Motion Design"],
    ["/video", "/video-production", "Video Production"],
  ])("canonicalizes legacy route %s", async (path, canonicalPath, label) => {
    await renderAt(path);
    expect(window.location.pathname).toBe(canonicalPath);
    fireEvent.click(screen.getByRole("button", { name: "Services" }));
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
  });

  it.each([
    ["/social-media", "Social Media & Content Creation"],
    ["/video-production", "Video Production"],
    ["/motion-design", "Motion Design"],
    ["/digital-experience", "Programming & Digital Experience"],
  ])("highlights %s in the shared navigation", async (path, label) => {
    await renderAt(path);
    fireEvent.click(screen.getByRole("button", { name: "Services" }));
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
  });

  it("shows a clear empty state when a service has no published projects", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });
    await renderAt("/video-production");
    expect(await screen.findByText(/no video projects are published yet/i)).toBeInTheDocument();
  });

  it("shows a not-found page for an unknown path", async () => {
    await renderAt("/unknown-page");
    expect(screen.getByRole("heading", { name: "Page not found." })).toBeInTheDocument();
  });
});

describe("/admin", () => {
  it("shows the sign-in form to signed-out visitors and no project data", async () => {
    await renderAt("/admin");
    expect(screen.getByRole("button", { name: /sign in securely/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveAttribute("autocomplete", "email");
    expect(screen.queryByText("Safe project")).not.toBeInTheDocument();
  });

  it("offers all canonical categories when creating a project", async () => {
    sessionStorage.setItem("cco_admin_session", JSON.stringify({
      access_token: "test-token",
      expires_at: Date.now() + 3600_000,
    }));
    await renderAt("/admin");
    fireEvent.click(await screen.findByRole("button", { name: /new project/i }));

    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Brand Strategy & Visual Identity",
      "Social Media & Content Creation",
      "Video Production",
      "Motion Design",
      "Programming & Digital Experience",
    ]);
  });
});
