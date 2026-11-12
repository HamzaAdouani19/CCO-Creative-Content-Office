import { buildProjectPayload } from "./validation.js";
import { getCategoryDbSlug } from "../config/projectCategories.js";

const SUPABASE_URL = (import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const TOKEN_KEY = "cco_admin_session";

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function requireConfig() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your .env file.");
  }
}

function readSession() {
  try { return JSON.parse(sessionStorage.getItem(TOKEN_KEY) || "null"); }
  catch { return null; }
}

export function getSession() {
  return readSession();
}

export async function signIn(email, password) {
  requireConfig();
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || "Sign-in failed.");
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + Number(data.expires_in || 3600) * 1000,
    user: data.user,
  };
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  const session = readSession();
  sessionStorage.removeItem(TOKEN_KEY);
  if (session?.access_token && isSupabaseConfigured()) {
    fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` },
    }).catch(() => {});
  }
}

async function refreshSession(session) {
  if (!session?.refresh_token) throw new Error("Your session expired. Please sign in again.");
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    signOut();
    throw new Error("Your session expired. Please sign in again.");
  }
  const next = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: Date.now() + Number(data.expires_in || 3600) * 1000, user: data.user || session.user };
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(next));
  return next;
}

async function api(path, options = {}, authenticated = false) {
  requireConfig();
  let session = readSession();
  if (authenticated && session?.expires_at && session.expires_at < Date.now() + 30000) {
    session = await refreshSession(session);
  }
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    ...(authenticated && session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && authenticated) signOut();
    throw new Error(data?.message || data?.details || data?.hint || "Request failed. Check your connection and Supabase policies.");
  }
  return data;
}

export async function getPublishedProjects(category) {
  if (!isSupabaseConfigured()) return [];
  const query = new URLSearchParams({
    select: "id,title,category,description,cover_image,project_url,github_url,video_url,year,created_at",
    is_published: "eq.true",
    order: "created_at.desc",
  });
  if (category) query.set("category", `eq.${category}`);
  return api(`/rest/v1/projects?${query.toString()}`);
}

export async function getAdminProjects() {
  const adminRecord = await api("/rest/v1/admin_users?select=user_id&limit=1", {}, true);
  if (!Array.isArray(adminRecord) || adminRecord.length === 0) {
    throw new Error("This account is signed in but is not authorized as a CCO administrator.");
  }
  return api("/rest/v1/projects?select=*&order=created_at.desc", {}, true);
}

export async function saveProject(project) {
  const editing = Boolean(project.id);
  const payload = buildProjectPayload(project);
  payload.category = getCategoryDbSlug(payload.category);
  if (editing) {
    return api(`/rest/v1/projects?id=eq.${encodeURIComponent(project.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload),
    }, true);
  }
  return api("/rest/v1/projects", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  }, true);
}

export async function deleteProject(id) {
  return api(`/rest/v1/projects?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" }, true);
}
