import { describe, it, expect } from "vitest";
import { isSafeHttpsUrl, safeHref, buildProjectPayload } from "../src/lib/validation.js";

describe("isSafeHttpsUrl", () => {
  it.each(["https://example.com", "https://sub.example.com/a?b=1#c", " https://example.com "])("accepts %s", (v) => {
    expect(isSafeHttpsUrl(v)).toBe(true);
  });
  it.each(["", "http://example.com", "javascript:alert(1)", "data:text/html,x", "//example.com", "/relative", "https://", "https://a b.com", null, undefined, 42])(
    "rejects %s",
    (v) => expect(isSafeHttpsUrl(v)).toBe(false),
  );
});

describe("safeHref", () => {
  it("returns a trimmed safe URL and undefined otherwise", () => {
    expect(safeHref(" https://example.com ")).toBe("https://example.com");
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
  });
});

describe("buildProjectPayload", () => {
  it("enforces length limits", () => {
    expect(() => buildProjectPayload({ title: "x".repeat(121), category: "motion" })).toThrow(/120/);
    expect(() => buildProjectPayload({ title: "ok", category: "motion", description: "x".repeat(601) })).toThrow(/600/);
  });
  it("turns empty optional fields into null", () => {
    expect(buildProjectPayload({ title: "ok", category: "branding", year: "" })).toMatchObject({
      cover_image: null, project_url: null, github_url: null, video_url: null, year: null, is_published: false,
    });
  });
});
