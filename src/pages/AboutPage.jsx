import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Instagram, Linkedin, Facebook } from "lucide-react";
import SiteNav from "../components/SiteNav.jsx";
import usePageMeta from "../hooks/usePageMeta.js";
import { PROJECT_CATEGORIES } from "../config/projectCategories.js";
import "./site.css";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "ccocreative.cco@gmail.com";
const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/", Icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com/", Icon: Linkedin },
  { label: "Facebook", href: "https://facebook.com/", Icon: Facebook },
];

const VALUES = [
  ["Creativity", "We start from an unexpected idea, not a template."],
  ["Innovation", "We use new tools when they make the work better."],
  ["Authenticity", "Every brand we shape stays true to who it is."],
  ["Collaboration", "Clients are part of the team from day one."],
  ["Excellence", "We finish the details nobody asked about."],
  ["Strategic thinking", "Every creative choice answers a business goal."],
];

const STEPS = [
  ["Discover", "Understanding the brand, its audience and its objectives."],
  ["Strategize", "Developing the right creative direction and strategy."],
  ["Create", "Designing, producing and developing creative solutions."],
  ["Deliver", "Bringing ideas to life through impactful experiences."],
];

export default function AboutPage() {
  const root = useRef(null);
  usePageMeta(
    "CCO — Creative Content Office | Creative agency",
    "CCO is a full-service creative agency: brand identity, social media, video, motion design and digital experiences.",
  );

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.from(".ab-hero h1 .line > span", {
        yPercent: 110,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
      });
      gsap.from(".ab-hero-meta > *", { opacity: 0, y: 16, delay: 0.5, stagger: 0.08 });
      gsap.fromTo(
        ".ab-steps-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: ".ab-steps", start: "top 75%", end: "bottom 60%", scrub: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="site-page" ref={root}>
      <SiteNav active="about" />
      <main>
        <section className="ab-hero">
          <h1>
            <span className="line"><span>Ideas deserve</span></span>
            <span className="line"><span>to be seen,</span></span>
            <span className="line"><span>felt and remembered.</span></span>
          </h1>
          <div className="ab-hero-meta">
            <p>
              CCO — Creative Content Office is a full-service creative agency in Djerba,
              working with brands everywhere.
            </p>
            <a href="#services" className="btn">See our services <ArrowUpRight size={16} /></a>
          </div>
        </section>

        <section className="ab-who" id="who-we-are">
          <h2>Who we are</h2>
          <div>
            <p className="lead">
              We combine strategy, visual storytelling and digital craft under one roof.
            </p>
            <p>
              One team handles your identity, your content, your films, your motion and your
              website, so your brand looks and sounds the same everywhere it appears.
            </p>
          </div>
        </section>

        <section className="ab-philosophy" id="philosophy">
          <h2>Our philosophy</h2>
          <p>
            Creativity is not making things look good. It is communicating an idea clearly,
            creating an experience worth having, and building a lasting connection between a
            brand and the people it speaks to.
          </p>
        </section>

        <section className="ab-values" id="values">
          <h2>Our values</h2>
          <dl>
            {VALUES.map(([title, description]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="ab-approach" id="approach">
          <h2>Our creative approach</h2>
          <ol className="ab-steps">
            <span className="ab-steps-line" aria-hidden="true" />
            {STEPS.map(([title, description], i) => (
              <li key={title}>
                <b>{String(i + 1).padStart(2, "0")}</b>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="ab-services" id="services">
          <h2>Our services</h2>
          <div className="ab-service-list">
            {PROJECT_CATEGORIES.map((category) => (
              <a
                key={category.slug}
                href={`/${category.slug}`}
                className="ab-service"
                style={{ "--c": category.color, "--img": `url(${category.image})` }}
              >
                <h3>{category.label}</h3>
                <p>{category.cardText}</p>
                <span className="ab-service-go">
                  Explore service <ArrowUpRight size={16} />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="ab-contact" id="contact">
          <h2>Have something worth saying? Let’s make it impossible to ignore.</h2>
          <p>Tell us about your project. We reply within two working days.</p>
          <a className="ab-mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <div className="ab-contact-row">
            <a
              className="btn btn-light"
              href={`mailto:${EMAIL}?subject=${encodeURIComponent("New project")}`}
            >
              Start a project <ArrowUpRight size={16} />
            </a>
            <ul className="ab-social">
              {SOCIALS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                    <Icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <footer className="site-foot">
        <span>© {new Date().getFullYear()} CCO · Creative Content Office</span>
        <a href="/admin">Studio access</a>
      </footer>
    </div>
  );
}
