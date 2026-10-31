/** Input validation shared by the admin form, the REST client and public rendering. */

export const CATEGORIES = ["branding", "motion", "development"];
export const LIMITS = { title: 120, description: 600 };

/** True only for absolute https:// URLs. Rejects javascript:, data:, http:, relative paths. */
export function isSafeHttpsUrl(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

/** Defence in depth for rendering: returns the URL if safe, otherwise undefined. */
export function safeHref(value) {
  return isSafeHttpsUrl(value) ? value.trim() : undefined;
}

function optionalUrl(value, label) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (!isSafeHttpsUrl(text)) throw new Error(`${label} must be a valid https:// URL.`);
  return text;
}

/** Validates and normalises an admin project form. Throws an Error with a user-facing message. */
export function buildProjectPayload(project) {
  const title = String(project?.title ?? "").trim();
  if (!title) throw new Error("A project title is required.");
  if (title.length > LIMITS.title) throw new Error(`Title must be ${LIMITS.title} characters or fewer.`);
  if (!CATEGORIES.includes(project?.category)) throw new Error("Choose a valid category.");
  const description = String(project?.description ?? "").trim();
  if (description.length > LIMITS.description) throw new Error(`Description must be ${LIMITS.description} characters or fewer.`);
  const year = String(project?.year ?? "").trim();
  if (year && !/^\d{4}$/.test(year)) throw new Error("Year must be four digits.");

  return {
    title,
    category: project.category,
    description,
    cover_image: optionalUrl(project.cover_image, "Cover image URL"),
    project_url: optionalUrl(project.project_url, "Live project URL"),
    github_url: optionalUrl(project.github_url, "GitHub URL"),
    video_url: optionalUrl(project.video_url, "Video URL"),
    year: year || null,
    is_published: Boolean(project.is_published),
  };
}
