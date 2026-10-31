import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const rows = [
  { id: "1", title: "Safe project", category: "development", description: "ok", project_url: "https://example.com/live", github_url: "https://github.com/x/y", video_url: null, cover_image: null, year: "2026" },
  { id: "2", title: "Unsafe project", category: "development", description: "bad", project_url: "javascript:alert(1)", github_url: "http://insecure.example", video_url: null, cover_image: null, year: "2025" },
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
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("/development", () => {
  it("renders published projects and only exposes https links", async () => {
    await renderAt("/development");
    await waitFor(() => expect(screen.getByText("Safe project")).toBeInTheDocument());
    const live = screen.getByRole("link", { name: /view project/i });
    expect(live).toHaveAttribute("href", "https://example.com/live");
    expect(live).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs.some((h) => h?.startsWith("javascript:"))).toBe(false);
    expect(hrefs).not.toContain("http://insecure.example");
  });
});

describe("/admin", () => {
  it("shows the sign-in form to signed-out visitors and no project data", async () => {
    await renderAt("/admin");
    expect(screen.getByRole("button", { name: /sign in securely/i })).toBeInTheDocument();
    expect(screen.queryByText("Safe project")).not.toBeInTheDocument();
  });
});
