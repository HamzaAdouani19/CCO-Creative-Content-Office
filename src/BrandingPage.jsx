import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Plus,
  Minus,
  MoveUpRight,
  Sparkles,
} from "lucide-react";
import ProjectDetail from "./Projectdetail";
import SiteNav from "./components/SiteNav.jsx";
import { getPublishedProjects } from "./lib/supabaseRest.js";
import "./pages/site.css";

/* Alkif images (output of crop-alkif.py → put them in src/assets/alkif/) */
import alkifHero from "./assets/Alkif/brand alkif.png";
import alkifSignage from "./assets/Alkif/produits.png";
import alkifStory from "./assets/Alkif/our story.png";
import alkifLogoBurgundy from "./assets/Alkif/logo_red.png";
import alkifLogoCream from "./assets/Alkif/logo_crem.png";
import alkifLogoGold from "./assets/Alkif/logo_gold.png";
import alkifStationery from "./assets/Alkif/stylo.png";
import alkifFlag from "./assets/Alkif/flag.png";
import alkifPackaging from "./assets/Alkif/cup.jpg";
import alkifUniforms from "./assets/Alkif/maillot_3.png";
import alkifCups from "./assets/Alkif/cup.jpg";
import alkifApron from "./assets/Alkif/cache.png";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    number: "01",
    name: "Alkif - الكيف",
    category: "COFFEE · BRAND IDENTITY",
    year: "2026",
    color: "luma",
    image: alkifHero,
    description:
      "A luxury coffee brand that turns a daily cup into a slow, distinctive ritual.",
    discovery:
      "ALKIF is a coffee brand built around the pleasure of slowing down. The goal was to create an identity that turns an everyday coffee into a distinctive ritual, blending Tunisian character with a refined, premium experience.",
    innerWorld:
      "At its heart, ALKIF celebrates comfort, authenticity, and the art of enjoying the moment. The brand voice is warm, confident, and sophisticated — bringing together local identity and contemporary coffee culture.",
    visualWorld:
      "The identity combines expressive Arabic calligraphy with elegant Latin typography. Deep burgundy, warm cream, and metallic gold create a rich visual language inspired by coffee, craftsmanship, and timeless elegance.",
    execution:
      "The identity extends across packaging, takeaway cups, signage, stationery, and staff uniforms. Every touchpoint follows one consistent visual system, making ALKIF recognizable from the first impression to the last sip.",
    overview: `ALKIF is a coffee brand built around the pleasure of slowing down. The goal was to create an identity that turns an everyday coffee into a distinctive ritual, blending Tunisian character with a refined, premium experience.`,
    palette: [
      { name: "Espresso", hex: "#400902" },
      { name: "Caramel", hex: "#6c4a1d" },
      { name: "Cream", hex: "#f4e9cd" },
      { name: "White", hex: "#ffffff" },
    ],
    typography: "Playfair Display · Montserrat",
    deliverables: [
      "Logo system",
      "Colour palette",
      "Typography",
      "Art direction",
      "Digital applications",
    ],
    secondaryImage: alkifSignage,
    images: {
      hero: alkifHero,
      discovery: alkifSignage,
      innerWorld: alkifStory,
      visual: [alkifLogoBurgundy, alkifLogoCream, alkifLogoGold],
      execution: [
        alkifStationery,
        alkifFlag,
        alkifPackaging,
        alkifUniforms,
        alkifCups,
        alkifApron,
      ],
    },
  },
  {
    number: "02",
    name: "Otherworld",
    category: "AI · VISUAL IDENTITY",
    year: "2025",
    color: "otherworld",
    image:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1500&q=85",
    description:
      "A distinctive visual language for technology that opens up new possibilities.",
    discovery:
      "Otherworld is an emerging AI company with powerful technology and no visual identity to match it. Most brands in the space look the same: blue gradients and glowing brains. The challenge was to find a look that felt curious and human instead.",
    innerWorld:
      "The brand is built on discovery, the moment you step through a door into somewhere new. The tone is exploratory, bold and open, speaking to people who want to see what technology could become, not just what it does today.",
    visualWorld:
      "A deep void background lets ultraviolet and signal blue glow with real contrast. Bold geometric type and experimental layouts create tension and movement, so the identity always feels like it is slightly ahead of where you are.",
    execution:
      "The system covers the logo and symbol, a flexible visual language, colour rules and campaign direction. It was designed to scale from a product interface to a launch campaign without losing its character.",
    overview:
      "An expressive identity built around curiosity, contrast and a sense of discovery for an emerging technology brand.",
    palette: [
      { name: "Void", hex: "#111018" },
      { name: "Ultraviolet", hex: "#8B5CF6" },
      { name: "Signal Blue", hex: "#69D5FF" },
      { name: "Mist", hex: "#EAE8F2" },
    ],
    typography: "Geometric sans · Bold display type · Experimental layouts",
    deliverables: [
      "Logo & symbol",
      "Visual language",
      "Colour system",
      "Typography",
      "Campaign direction",
    ],
    secondaryImage:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1500&q=85",
  },
  {
    number: "03",
    name: "Goodside",
    category: "WELLNESS · BRAND WORLD",
    year: "2024",
    color: "goodside",
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1500&q=85",
    description:
      "A calmer, more human approach to everyday wellbeing, built to stand out on shelf and screen.",
    discovery:
      "Goodside wanted to make wellbeing feel less like a trend and more like a daily habit. The wellness shelf is crowded and loud, so the opportunity was to stand out by being quieter, warmer and more honest than everyone around it.",
    innerWorld:
      "The brand takes the side of the everyday: small routines, simple rituals and good days. Its voice is friendly, grounded and never preachy, like a calm friend who happens to know a lot.",
    visualWorld:
      "Forest green, sage, oat and clay bring an earthy palette that feels natural and tactile. A humanist sans is paired with a soft editorial serif, and generous white space gives every layout room to breathe.",
    execution:
      "The brand world was designed for both shelf and screen: the brand mark, packaging direction and a set of social templates. Everything shares the same calm rhythm, so each touchpoint feels like part of one routine.",
    overview:
      "A warm, minimal brand world that makes wellbeing feel accessible, grounded and part of everyday life.",
    palette: [
      { name: "Forest", hex: "#243C32" },
      { name: "Sage", hex: "#A8B7A0" },
      { name: "Oat", hex: "#F0E8D9" },
      { name: "Clay", hex: "#C98265" },
    ],
    typography: "Humanist sans · Soft editorial serif · Spacious composition",
    deliverables: [
      "Brand mark",
      "Colour palette",
      "Typography",
      "Packaging direction",
      "Social templates",
    ],
    secondaryImage:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1500&q=85",
  },
];

const services = [
  [
    "01",
    "Brand strategy",
    "Positioning, audience insight, naming, brand architecture and the story behind the business.",
  ],
  [
    "02",
    "Visual identity",
    "Distinctive logos, typography, colour systems, art direction and complete brand guidelines.",
  ],
  [
    "03",
    "Digital experiences",
    "Websites, landing pages and digital touchpoints that bring your brand to life.",
  ],
  [
    "04",
    "Brand in motion",
    "Motion principles, launch campaigns, social systems and the assets that keep you consistent.",
  ],
];

const faqs = [
  [
    "What kind of businesses do you work with?",
    "We partner with ambitious founders, growing teams and established businesses that are ready to make their next move. We are especially at home with technology, culture and future-facing services.",
  ],
  [
    "How long does a branding project take?",
    "A focused identity project typically takes 4–6 weeks. A wider strategy, identity and website engagement may take 8–12 weeks, depending on scope and feedback rounds.",
  ],
  [
    "Do you design and build websites?",
    "Yes. We can lead the digital experience from strategy and art direction through interface design and front-end implementation, or collaborate with your in-house developers.",
  ],
  [
    "How do we get started?",
    "Send a short note about your business, what you are working towards and your ideal timing. We will arrange an introductory conversation and recommend a clear next step.",
  ],
];

function Eyebrow({ children, light = false }) {
  return (
    <p className={`eyebrow ${light ? "eyebrow-light" : ""}`}>
      <span className="eyebrow-dot" />
      {children}
    </p>
  );
}

function ProjectCard({ project, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      className={`project-card project-card-button ${project.color}`}
      aria-label={`View ${project.name} brand identity case study`}
    >
      <div className="project-image-wrap">
        <img
          src={project.image}
          alt={`${project.name} creative brand project`}
          className="project-image"
          loading="lazy"
        />
        <div className="project-image-overlay" />
        <span className="project-number">
          {project.number} / BRAND IDENTITY
        </span>
        <span className="project-open">
          <ArrowUpRight size={22} />
        </span>
        <div className="project-art-label">
          {project.name}
          <span>®</span>
        </div>
        <span className="project-view-label">VIEW CASE STUDY</span>
      </div>
      <div className="project-meta">
        <div>
          <h3>{project.name}</h3>
          <p>{project.category}</p>
        </div>
        <span>{project.year}</span>
      </div>
      <p className="project-description">{project.description}</p>
    </button>
  );
}

function FAQItem({ question, answer, open, onClick }) {
  return (
    <div className={`faq-item ${open ? "faq-item-open" : ""}`}>
      <button className="faq-question" onClick={onClick} aria-expanded={open}>
        <span>{question}</span>
        <span className="faq-icon">
          {open ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      <div
        className="faq-answer"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  const contactEmail =
    import.meta.env.VITE_CONTACT_EMAIL || "hamzaadouani1919@gmail.com";
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    budget: "",
    message: "",
  });
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("Please complete your name, email and project details.");
      return;
    }
    const subject = encodeURIComponent(
      `Project enquiry — ${form.company || form.name}`,
    );
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company || "Not provided"}\nBudget: ${form.budget || "Not specified"}\n\nProject details:\n${form.message}`,
    );
    setStatus("Your email app should open with the enquiry prepared.");
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          Your name *
          <input
            name="name"
            value={form.name}
            onChange={update}
            placeholder="Jane Smith"
            autoComplete="name"
          />
        </label>
        <label>
          Email address *
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            placeholder="jane@company.com"
            autoComplete="email"
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Company
          <input
            name="company"
            value={form.company}
            onChange={update}
            placeholder="Your brand or business"
          />
        </label>
        <label>
          Estimated budget
          <select name="budget" value={form.budget} onChange={update}>
            <option value="">Choose a range</option>
            <option>Under £3,000</option>
            <option>£3,000–£7,500</option>
            <option>£7,500–£15,000</option>
            <option>£15,000+</option>
            <option>Not sure yet</option>
          </select>
        </label>
      </div>
      <label>
        Tell us a little about the project *
        <textarea
          name="message"
          value={form.message}
          onChange={update}
          placeholder="What are you building, and what would success look like?"
          rows="4"
        />
      </label>
      {status && (
        <p className="form-status" role="status">
          {status}
        </p>
      )}
      <button className="button button-dark form-submit" type="submit">
        Send project enquiry <ArrowUpRight size={17} />
      </button>
      <p className="form-note">
        This demo opens your email app. Connect a form backend before collecting
        real enquiries.
      </p>
    </form>
  );
}

export default function BrandingPage() {
  const heroRef = useRef(null);
  const [faqOpen, setFaqOpen] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [managedBrandProjects, setManagedBrandProjects] = useState([]);
  const allProjects = [
    ...projects,
    ...managedBrandProjects.map((p, i) => ({
      number: `C${String(i + 1).padStart(2, "0")}`,
      name: p.title,
      category: "BRAND IDENTITY",
      year: p.year || String(new Date().getFullYear()),
      color: "luma",
      image: p.cover_image || alkifHero,
      description: p.description || "A selected CCO branding project.",
      discovery: p.description || "A selected CCO branding project.",
      innerWorld: p.description || "A selected CCO branding project.",
      visualWorld: p.description || "A selected CCO branding project.",
      execution: p.description || "A selected CCO branding project.",
      overview: p.description || "A selected CCO branding project.",
      palette: [
        { name: "CCO Acid", hex: "#D7FF3F" },
        { name: "Ink", hex: "#171815" },
        { name: "Paper", hex: "#F4F2EC" },
      ],
      typography: "Defined in the project identity.",
      deliverables: ["Visual identity", "Creative direction"],
      secondaryImage: p.cover_image || alkifHero,
      images: {
        hero: p.cover_image || alkifHero,
        discovery: p.cover_image || alkifHero,
        execution: [],
      },
      projectUrl: p.project_url,
    })),
  ];
  const closeProjectDetail = React.useCallback(
    () => setSelectedProject(null),
    [],
  );
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    let active = true;
    getPublishedProjects("branding")
      .then((rows) => {
        if (active) setManagedBrandProjects(rows || []);
      })
      .catch(() => {
        /* The static portfolio remains available if CMS is offline. */
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-kicker, .hero-title-line, .hero-copy, .hero-actions", {
        y: 34,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.1,
      });
      gsap.from(".hero-stamp", {
        scale: 0.65,
        rotate: -18,
        opacity: 0,
        duration: 1,
        delay: 0.55,
        ease: "back.out(1.7)",
      });
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 38, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          },
        );
      });
      gsap.utils.toArray(".service-row").forEach((el, i) => {
        gsap.from(el, {
          x: i % 2 ? 22 : -22,
          opacity: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
      const items = gsap.utils.toArray(".project-stack-item");
      items.forEach((item, i) => {
        if (i === items.length - 1) return; // the last card doesn't shrink
        gsap.to(item.querySelector(".project-card"), {
          scale: 0.92,
          filter: "brightness(0.55)",
          ease: "none",
          scrollTrigger: {
            trigger: items[i + 1],
            start: "top bottom",
            end: "top 15%",
            scrub: true,
          },
        });
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} id="top" className="site-shell">
      <SiteNav active="branding" />
      <main>
        <section className="hero section-pad">
          <div className="hero-topline hero-kicker">
            <Eyebrow>INDEPENDENT BRAND & DIGITAL STUDIO</Eyebrow>
            <span className="hero-location">DJERBA · WORKING EVERYWHERE</span>
          </div>
          <div className="hero-heading-wrap">
            <h1 className="hero-title">
              <span className="hero-title-line">From Ideas</span>
              <span className="hero-title-line hero-title-second">
                To Impact<span className="hero-period">.</span>
              </span>
              <span className="hero-title-line hero-outline">
                Creative Content Office.
              </span>
            </h1>
            <div className="hero-stamp" aria-label="Strategy meets imagination">
              <div className="stamp-ring">
                IDEAS · DESERVE · TO BE SEEN ·
              </div>
              <Sparkles size={28} strokeWidth={1.5} />
              <span>
                IDEAS
                <br />
                DESERVE
                <br />
                <b>TO BE SEEN</b>
              </span>
            </div>
          </div>
          <div className="hero-bottom">
            <p className="hero-copy">
             We build meaningful brands and digital experiences through strategy, design, and creative thinking.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#work">
                Explore our work <ArrowDownRight size={17} />
              </a>
              <a className="text-link" href="#about">
                Meet the studio <ArrowRight size={16} />
              </a>
            </div>
          </div>
          <div className="hero-foot">
            <span>
              SCROLL TO EXPLORE <ArrowDownRight size={14} />
            </span>
            <span>STRATEGY · BRANDING · CREATIVE · DIGITAL</span>
            <span>EST. 2026</span>
          </div>
        </section>

        <section className="ticker" aria-label="Studio capabilities">
          <div className="ticker-track">
            {Array.from({ length: 2 }).map((_, i) => (
              <div className="ticker-group" key={i}>
                <span>IDEAS WITH PURPOSE</span>
                <Asterisk />
                <span>STRATEGY WITH SOUL</span>
                <Asterisk />
                <span>DESIGN THAT DOES MORE</span>
                <Asterisk />
                <span>BUILT FOR WHAT’S NEXT</span>
                <Asterisk />
              </div>
            ))}
          </div>
        </section>

        <section className="work-section section-pad" id="work">
          <div className="section-heading reveal">
            <div>
              <Eyebrow>01 / BRANDING PROJECTS</Eyebrow>
              <h2>
                Brands made
                <br />
                <span className="serif-italic">to mean more.</span>
              </h2>
            </div>
            <p>
              Explore selected brand identities, from the first idea to a
              complete visual system. Open any project to explore the full case
              study.
            </p>
          </div>
          <div className="project-grid">
            {allProjects.map((project, i) => (
              <div
                className="project-stack-item"
                key={project.number}
                style={{ "--i": i }}
              >
                <ProjectCard project={project} onOpen={setSelectedProject} />
              </div>
            ))}
          </div>
          <a className="all-work-link reveal" href="#contact">
            <span>Have a good one in mind?</span>
            <b>
              Let’s make it happen <ArrowUpRight size={18} />
            </b>
          </a>
        </section>

        <section className="manifesto-section">
          <div
            className="manifesto-image"
            role="img"
            aria-label="Abstract sculptural architecture in warm sunlight"
          />
          <div className="manifesto-content">
            <Eyebrow light>02 / OUR POINT OF VIEW</Eyebrow>
            <h2 className="reveal">
              The world doesn’t need more brands.
              <br />
              <span>It needs more</span> <i>meaning.</i>
            </h2>
            <p className="manifesto-copy reveal">
              A logo is a starting point, not the finish line. We bring sharp
              thinking and creative instinct together to make brands people can
              understand, believe in and remember.
            </p>
            <a className="button button-light reveal" href="#about">
              What makes us different <ArrowUpRight size={16} />
            </a>
            <span className="manifesto-mark">
              <Asterisk size={76} strokeWidth={1} />
            </span>
          </div>
        </section>

        <section className="services-section section-pad" id="services">
          <div className="section-heading reveal">
            <div>
              <Eyebrow>03 / WHAT WE DO</Eyebrow>
              <h2>
                From big idea
                <br />
                to <span className="serif-italic">real impact.</span>
              </h2>
            </div>
            <p>
              One joined-up process. The right people around the table.
              Everything your brand needs to show up with clarity and
              confidence.
            </p>
          </div>
          <div className="services-list">
            {services.map(([number, title, description]) => (
              <article className="service-row" key={number}>
                <span className="service-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="service-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </article>
            ))}
          </div>
          <div className="services-note">
            <Sparkles size={18} />
            <span>Small enough to care. Experienced enough to deliver.</span>
          </div>
        </section>

        <section className="about-section section-pad" id="about">
          <div className="about-top reveal">
            <Eyebrow>04 / A LITTLE ABOUT US</Eyebrow>
            <span>CURIOUS MINDS. CONSIDERED WORK.</span>
          </div>
          <div className="about-layout">
            <h2 className="about-title reveal">
              Good work
              <br />
              starts with
              <br />
              <span className="serif-italic">good people.</span>
            </h2>
            <div className="about-body reveal">
              <p className="about-lead">
                We’re an independent creative studio for people building
                something with purpose.
              </p>
              <p>
                We ask better questions, get close to the heart of your business
                and find the one thing that makes you different. Then we turn
                that thinking into a brand system that works everywhere — from
                the first hello to the next big milestone.
              </p>
              <div className="about-stats">
                <div>
                  <strong>Strategy</strong>
                  <span>Before decoration</span>
                </div>
                <div>
                  <strong>Collaboration</strong>
                  <span>Always a team effort</span>
                </div>
                <div>
                  <strong>Ambition</strong>
                  <span>Built to go further</span>
                </div>
              </div>
              <a href="#contact" className="text-link">
                Get to know us <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="quote-section">
          <div className="quote-symbol">
            <Asterisk size={48} />
          </div>
          <blockquote className="reveal">
            “The best brands don’t just tell people what they do. They give
            people a reason to care.”
          </blockquote>
          <p>OUR BELIEF, IN A SENTENCE</p>
        </section>

        <section className="faq-section section-pad" id="faq">
          <div className="faq-intro reveal">
            <Eyebrow>05 / GOOD QUESTIONS</Eyebrow>
            <h2>
              Things you
              <br />
              <span className="serif-italic">might be wondering.</span>
            </h2>
            <p>
              Something else on your mind? We’re always happy to talk it
              through.
            </p>
            <a className="text-link" href="#contact">
              Ask us anything <ArrowRight size={16} />
            </a>
          </div>
          <div className="faq-list reveal">
            {faqs.map(([question, answer], i) => (
              <FAQItem
                key={question}
                question={question}
                answer={answer}
                open={faqOpen === i}
                onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}
              />
            ))}
          </div>
        </section>

        <section className="contact-section section-pad" id="contact">
          <div className="contact-heading reveal">
            <Eyebrow light>06 / YOUR NEXT CHAPTER</Eyebrow>
            <h2>
              Got a good
              <br />
              feeling<span className="contact-period">?</span>
            </h2>
            <p>
              Tell us where you want to go. We’ll help you figure out how to get
              there.
            </p>
            <a
              className="contact-email"
              href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || "hello@yourdomain.com"}`}
            >
              {import.meta.env.VITE_CONTACT_EMAIL || "hello@yourdomain.com"}{" "}
              <MoveUpRight size={18} />
            </a>
          </div>
          <div className="contact-form-wrap reveal">
            <ContactForm />
          </div>
          <div className="contact-decoration">
            <Asterisk size={110} strokeWidth={0.8} />
          </div>
        </section>
      </main>

      {selectedProject && (
        <ProjectDetail
          key={selectedProject.number}
          project={selectedProject}
          nextProject={
            allProjects[
              (Math.max(
                0,
                allProjects.findIndex(
                  (item) => item.number === selectedProject.number,
                ),
              ) +
                1) %
                allProjects.length
            ]
          }
          onClose={closeProjectDetail}
          onOpenNext={setSelectedProject}
        />
      )}

      <footer className="site-footer">
        <a href="#top" className="wordmark footer-wordmark">
          <span className="wordmark-symbol">
            <Asterisk size={24} />
          </span>
          <span>
            CCO<span className="wordmark-sub">® CREATIVE CONTENT OFFICE</span>
          </span>
        </a>
        <p>Independent by nature. Ambitious by design.</p>
        <div className="footer-links">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
          <a href="#top">Back to top ↑</a>
        </div>
        <span className="copyright">
          © {year} CCO · CREATIVE CONTENT OFFICE
        </span>
      </footer>
    </div>
  );
}
