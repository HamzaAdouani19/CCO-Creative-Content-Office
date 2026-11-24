import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Instagram } from "lucide-react";
import SiteNav from "../components/SiteNav.jsx";
import usePageMeta from "../hooks/usePageMeta.js";
import { PROJECT_CATEGORIES } from "../config/projectCategories.js";
import "./site.css";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "ccocreative.cco@gmail.com";
const WhatsAppIcon = ({ size = 20 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.52 3.48A11.87 11.87 0 0 0 12.06 0C5.48 0 .13 5.35.13 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.78 1.47h.01c6.58 0 11.93-5.35 11.94-11.93a11.87 11.87 0 0 0-3.48-8.42ZM12.06 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.98.99-3.63-.23-.37a9.86 9.86 0 0 1-1.52-5.26c0-5.46 4.45-9.91 9.92-9.91a9.85 9.85 0 0 1 7.02 2.91 9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.95 9.92Zm5.44-7.43c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.47-2.4-1.49-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
  </svg>
);
const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/creative_content_office/",
    Icon: Instagram,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/23663564",
    Icon: WhatsAppIcon,
  },
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
          <div className="ab-hero-art" aria-hidden="true">CCO</div>
          <div className="ab-hero-glow ab-hero-glow-one" aria-hidden="true" />
          <div className="ab-hero-glow ab-hero-glow-two" aria-hidden="true" />
          <h1>
            <span className="line"><span>Ideas deserve</span></span>
            <span className="line"><span>to be <em className="ab-gradient-text">seen,</em></span></span>
            <span className="line"><span>felt and <em className="ab-gradient-text">remembered.</em></span></span>
          </h1>
          <div className="ab-hero-meta">
            <p>
              CCO — Creative Content Office is a full-service creative agency in Djerba,
              working with brands everywhere.
            </p>
            <a href="#services" className="btn ab-hero-cta">See our services <ArrowUpRight size={18} /></a>
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
