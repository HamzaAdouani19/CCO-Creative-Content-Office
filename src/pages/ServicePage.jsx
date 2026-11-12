import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowUpRight, ExternalLink, Github, Play } from "lucide-react";
import SiteNav from "../components/SiteNav.jsx";
import usePageMeta from "../hooks/usePageMeta.js";
import {
  PROJECT_CATEGORIES,
  getCategoryBySlug,
  getCategoryDbValues,
} from "../config/projectCategories.js";
import { getPublishedProjects } from "../lib/supabaseRest.js";
import { safeHref } from "../lib/validation.js";
import "./site.css";

const EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "ccocreative.cco@gmail.com";

export default function ServicePage({ slug }) {
  const meta = getCategoryBySlug(slug);
  const root = useRef(null);
  const [result, setResult] = useState({ slug: null, projects: [], error: "" });
  const loading = result.slug !== slug;
  const projects = loading ? [] : result.projects;
  const error = loading ? "" : result.error;

  usePageMeta(`${meta.label} — CCO Creative Content Office`, meta.heroDescription);

  useEffect(() => {
    let alive = true;
    Promise.all(getCategoryDbValues(slug).map((value) => getPublishedProjects(value)))
      .then((lists) => {
        if (!alive) return;
        const seen = new Set();
        const projects = lists.flat().filter((project) => {
          if (!project || seen.has(project.id)) return false;
          seen.add(project.id);
          return true;
        });
        setResult({ slug, projects, error: "" });
      })
      .catch((e) => {
        if (alive) setResult({ slug, projects: [], error: e.message });
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.from(".sv-hero h1 .line > span", {
        yPercent: 110,
        duration: 0.9,
        stagger: 0.1,
        ease: "power4.out",
      });
    }, root);
    return () => ctx.revert();
  }, [slug]);

  const others = PROJECT_CATEGORIES.filter((category) => category.slug !== slug);

  return (
    <div className="site-page" ref={root} style={{ "--c": meta.color }}>
      <SiteNav active={slug} />
      <main>
        <section className="sv-hero" style={{ "--img": `url(${meta.image})` }}>
          <div className="sv-hero-img" aria-hidden="true" />
          <h1>
            <span className="line"><span>{meta.heroTitle[0]}</span></span>
            <span className="line"><span>{meta.heroTitle[1]}</span></span>
          </h1>
          <p>{meta.heroDescription}</p>
        </section>

        <section className="sv-detail">
          <h2>{meta.label}</h2>
          <div>
            <p className="lead">{meta.cardText}</p>
            <ul className="sv-caps">
              {meta.capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="sv-projects">
          <h2>Selected projects</h2>
          {error && <p className="sv-note">{error}</p>}
          {loading ? (
            <p className="sv-note">Loading projects…</p>
          ) : projects.length ? (
            <div className="sv-grid">
              {projects.map((project) => (
                <article key={project.id} className="sv-card">
                  <div className="sv-card-img">
                    {safeHref(project.cover_image) ? (
                      <img src={safeHref(project.cover_image)} alt={project.title} loading="lazy" />
                    ) : (
                      <span>{meta.short}</span>
                    )}
                  </div>
                  <div className="sv-card-body">
                    <h3>{project.title}</h3>
                    {project.year && <small>{project.year}</small>}
                    <p>{project.description}</p>
                    <div className="sv-links">
                      {safeHref(project.project_url) && (
                        <a href={safeHref(project.project_url)} target="_blank" rel="noreferrer">
                          View project <ExternalLink size={14} />
                        </a>
                      )}
                      {safeHref(project.github_url) && (
                        <a href={safeHref(project.github_url)} target="_blank" rel="noreferrer">
                          <Github size={14} /> Source
                        </a>
                      )}
                      {safeHref(project.video_url) && (
                        <a href={safeHref(project.video_url)} target="_blank" rel="noreferrer">
                          <Play size={14} /> Watch
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            !error && (
              <p className="sv-note">
                No {meta.short.toLowerCase()} projects are published yet. They appear here as
                soon as they are published from the admin workspace.
              </p>
            )
          )}
        </section>

        <section className="sv-cta">
          <h2>Need {meta.short.toLowerCase()} work? Tell us what you have in mind.</h2>
          <a
            className="btn btn-light"
            href={`mailto:${EMAIL}?subject=${encodeURIComponent(meta.label)}`}
          >
            Start a project <ArrowUpRight size={16} />
          </a>
        </section>

        <nav className="sv-others" aria-label="Other services">
          <h2>Other services</h2>
          <ul>
            {others.map((category) => (
              <li key={category.slug}>
                <a href={`/${category.slug}`} style={{ "--c": category.color }}>
                  {category.label} <ArrowUpRight size={16} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <footer className="site-foot">
        <span>© {new Date().getFullYear()} CCO · Creative Content Office</span>
        <a href="/">About</a>
      </footer>
    </div>
  );
}
