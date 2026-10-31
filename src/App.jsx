import React, { useEffect, useState } from "react";
import { ArrowUpRight, Code2, Clapperboard, Palette, ShieldCheck, ExternalLink, Github, Play, LockKeyhole, LogOut, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import BrandingPage from "./BrandingPage.jsx";
import logo from "./assets/logo-cco.svg";
import { deleteProject, getAdminProjects, getPublishedProjects, getSession, isSupabaseConfigured, saveProject, signIn, signOut } from "./lib/supabaseRest.js";
import { safeHref } from "./lib/validation.js";
import "./portfolio.css";

const categories = {
  motion: { label: "Motion & Video", eyebrow: "02 / MOVING IMAGE", title: <>Stories that<br/><em>move people.</em></>, description: "Motion design, video editing, campaigns and visual stories made to hold attention.", icon: Clapperboard },
  development: { label: "Development", eyebrow: "03 / DIGITAL PRODUCTS", title: <>Built to work.<br/><em>Made to matter.</em></>, description: "Websites, digital products and applications shaped by design, engineering and real-world use.", icon: Code2 },
};

function SiteSwitcher({ active }) {
  return <div className="cco-switcher">
    <a href="/branding" className="cco-brand"><img src={logo} alt="" /> <span>CCO<small>CREATIVE CONTENT OFFICE</small></span></a>
    <nav aria-label="Portfolio categories">
      <a className={active === "branding" ? "active" : ""} href="/branding"><Palette size={15}/> Branding</a>
      <a className={active === "motion" ? "active" : ""} href="/motion"><Clapperboard size={15}/> Motion</a>
      <a className={active === "development" ? "active" : ""} href="/development"><Code2 size={15}/> Development</a>
    </nav>
    <a className="cco-admin-link" href="/admin"><LockKeyhole size={14}/> Admin</a>
  </div>;
}

function CategoryPage({ category }) {
  const meta = categories[category];
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    getPublishedProjects(category).then(rows => { if (alive) setProjects(rows || []); })
      .catch(e => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [category]);
  const Icon = meta.icon;
  return <div className="cco-portfolio">
    <SiteSwitcher active={category}/>
    <main className="cco-category-main">
      <div className="cco-category-kicker"><span className="cco-dot"/> {meta.eyebrow}<span className="cco-location">DJERBA · WORKING EVERYWHERE</span></div>
      <div className="cco-category-hero">
        <div><p className="cco-overline">CREATIVE WORK, WITH INTENTION</p><h1>{meta.title}</h1><p className="cco-intro">{meta.description}</p></div>
        <div className="cco-category-stamp"><Icon size={36}/><span>IDEA → EXECUTION</span></div>
      </div>
      <div className="cco-category-rule"><span>SELECTED PROJECTS</span><span>{String(projects.length).padStart(2,"0")} PROJECTS</span></div>
      {!isSupabaseConfigured() && <div className="cco-notice">Portfolio CMS is not connected yet. Configure Supabase to load and manage published projects. The public page is ready for configuration.</div>}
      {error && <div className="cco-notice cco-error">{error}</div>}
      {loading ? <p className="cco-empty">Loading projects…</p> : projects.length ? <div className="cco-project-grid">
        {projects.map((p, i) => <article className="cco-managed-card" key={p.id}>
          <div className="cco-managed-image">{safeHref(p.cover_image) ? <img src={safeHref(p.cover_image)} alt={p.title} loading="lazy"/> : <div className="cco-image-placeholder"><Icon size={42}/><span>CCO / {meta.label.toUpperCase()}</span></div>}<span className="cco-card-number">{String(i+1).padStart(2,"0")} / {category.toUpperCase()}</span></div>
          <div className="cco-managed-meta"><div><h2>{p.title}</h2><p>{p.description}</p></div><span>{p.year || "PROJECT"}</span></div>
          <div className="cco-card-links">
            {safeHref(p.project_url) && <a href={safeHref(p.project_url)} target="_blank" rel="noreferrer">View project <ExternalLink size={15}/></a>}
            {safeHref(p.github_url) && <a href={safeHref(p.github_url)} target="_blank" rel="noreferrer"><Github size={15}/> Source</a>}
            {safeHref(p.video_url) && <a href={safeHref(p.video_url)} target="_blank" rel="noreferrer"><Play size={15}/> Watch</a>}
          </div>
        </article>)}
      </div> : !error && <div className="cco-empty"><span>Nothing published here. Yet.</span><p>New projects will appear here after they are added and published in the admin workspace.</p></div>}
      <section className="cco-bottom-cta"><p>HAVE A PROJECT IN MIND?</p><h2>Let’s make<br/><em>something matter.</em></h2><a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || "hello@yourdomain.com"}`}>Start a conversation <ArrowUpRight size={18}/></a></section>
    </main>
    <footer className="cco-portfolio-footer"><span>© {new Date().getFullYear()} CCO · CREATIVE CONTENT OFFICE</span><span>STRATEGY · DESIGN · DEVELOPMENT</span><a href="/admin">Studio access ↗</a></footer>
  </div>;
}

const emptyProject = { title: "", category: "branding", description: "", cover_image: "", project_url: "", github_url: "", video_url: "", year: String(new Date().getFullYear()), is_published: false };

function AdminPage() {
  const [session, setSession] = useState(() => getSession());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadRows() {
    try { setRows(await getAdminProjects() || []); setError(""); }
    catch (e) { setError(e.message); }
  }
  useEffect(() => { if (session?.access_token) loadRows(); }, [session?.access_token]);

  async function login(e) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try { const s = await signIn(email.trim(), password); setSession(s); setPassword(""); setMessage("Signed in. Checking admin permissions…"); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function submitProject(e) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await saveProject(draft);
      setDraft(null); await loadRows(); setMessage("Project saved.");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function removeProject(id) {
    if (!window.confirm("Delete this project permanently?")) return;
    setBusy(true); setError(""); setMessage("");
    try { await deleteProject(id); await loadRows(); setMessage("Project deleted."); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function logout() { signOut(); setSession(null); setRows([]); setDraft(null); }

  return <div className="cco-admin-shell">
    <header className="cco-admin-header"><a href="/branding" className="cco-brand"><img src={logo} alt=""/> <span>CCO<small>ADMIN WORKSPACE</small></span></a><a href="/branding">← Public website</a></header>
    {!session?.access_token ? <main className="cco-login-wrap">
      <div className="cco-login-symbol"><ShieldCheck size={30}/></div><p className="cco-overline">PRIVATE STUDIO ACCESS</p><h1>Welcome<br/><em>back.</em></h1><p className="cco-login-copy">Sign in with the administrator account created in your Supabase project. Public registration is intentionally not available here.</p>
      {!isSupabaseConfigured() && <div className="cco-notice">Supabase is not configured. Add the public project URL and anon key to `.env.local` and apply `supabase/schema.sql` before signing in.</div>}
      <form className="cco-login-form" onSubmit={login}>
        <label>Email address<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@yourdomain.com"/></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/></label>
        {error && <p className="cco-alert">{error}</p>}
        <button disabled={busy || !isSupabaseConfigured()}>{busy ? "Signing in…" : "Sign in securely"} <ArrowUpRight size={17}/></button>
      </form>
      <p className="cco-login-foot"><LockKeyhole size={13}/> Admin access is enforced by database policies, not by this page alone.</p>
    </main> : <main className="cco-dashboard">
      <div className="cco-dashboard-top"><div><p className="cco-overline">PRIVATE WORKSPACE / CONTENT</p><h1>Project<br/><em>management.</em></h1></div><button className="cco-logout" onClick={logout}><LogOut size={15}/> Sign out</button></div>
      <div className="cco-dashboard-bar"><div><strong>{rows.length.toString().padStart(2,"0")}</strong><span>PROJECTS IN CMS</span></div><button className="cco-primary" onClick={()=>{setDraft({...emptyProject});setError("");setMessage("");}}><Plus size={17}/> New project</button></div>
      {message && <p className="cco-success">{message}</p>}{error && <p className="cco-alert">{error}</p>}
      {draft && <form className="cco-project-form" onSubmit={submitProject}>
        <div className="cco-form-title"><h2>{draft.id ? "Edit project" : "New project"}</h2><button type="button" className="cco-close-form" onClick={()=>setDraft(null)}>Cancel ×</button></div>
        <div className="cco-form-grid">
          <label>Project title *<input required maxLength="120" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
          <label>Category *<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}><option value="branding">Branding</option><option value="motion">Motion & video</option><option value="development">Development</option></select></label>
          <label>Year<input maxLength="4" inputMode="numeric" value={draft.year || ""} onChange={e=>setDraft({...draft,year:e.target.value.replace(/\D/g,"").slice(0,4)})}/></label>
          <label>Cover image URL<input type="url" placeholder="https://…" value={draft.cover_image || ""} onChange={e=>setDraft({...draft,cover_image:e.target.value})}/></label>
          <label>Live project URL<input type="url" placeholder="https://…" value={draft.project_url || ""} onChange={e=>setDraft({...draft,project_url:e.target.value})}/></label>
          <label>GitHub URL<input type="url" placeholder="https://github.com/…" value={draft.github_url || ""} onChange={e=>setDraft({...draft,github_url:e.target.value})}/></label>
          <label>Video URL<input type="url" placeholder="https://…" value={draft.video_url || ""} onChange={e=>setDraft({...draft,video_url:e.target.value})}/></label>
          <label className="cco-publish-toggle"><input type="checkbox" checked={Boolean(draft.is_published)} onChange={e=>setDraft({...draft,is_published:e.target.checked})}/> Publish on public portfolio</label>
          <label className="cco-wide">Short description<textarea rows="3" maxLength="600" value={draft.description || ""} onChange={e=>setDraft({...draft,description:e.target.value})}/></label>
        </div>
        <div className="cco-form-actions"><button type="submit" disabled={busy}>{busy ? "Saving…" : "Save project"} <ArrowUpRight size={16}/></button></div>
      </form>}
      <div className="cco-admin-project-list"><div className="cco-list-head"><span>PROJECT</span><span>CATEGORY</span><span>STATUS</span><span>ACTIONS</span></div>
        {rows.map(row=><article className="cco-admin-row" key={row.id}><div className="cco-admin-project-name">{row.cover_image ? <img src={row.cover_image} alt="" loading="lazy"/> : <div className="cco-mini-placeholder"><Code2 size={18}/></div>}<div><strong>{row.title}</strong><small>{row.year || "No year"}</small></div></div><span className="cco-category-pill">{row.category}</span><span className={row.is_published ? "cco-published" : "cco-unpublished"}>{row.is_published ? <><Eye size={14}/> Published</> : <><EyeOff size={14}/> Draft</>}</span><div className="cco-row-actions"><button aria-label={`Edit ${row.title}`} onClick={()=>{setDraft({...row});setError("");setMessage("");}}><Pencil size={15}/></button><button aria-label={`Delete ${row.title}`} onClick={()=>removeProject(row.id)}><Trash2 size={15}/></button></div></article>)}
        {!rows.length && !error && <div className="cco-empty">No projects in the CMS yet. Create your first project above.</div>}
      </div>
      <p className="cco-admin-note"><ShieldCheck size={16}/> The database must restrict writes to approved administrator accounts. Never expose a service-role key in this app.</p>
    </main>}
  </div>;
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/admin") return <AdminPage/>;
  if (path === "/motion") return <CategoryPage category="motion"/>;
  if (path === "/development") return <CategoryPage category="development"/>;
  return <BrandingPage/>;
}
