import React, { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, X } from "lucide-react";
import "./project-detail.css";

gsap.registerPlugin(ScrollTrigger);

/* Split a paragraph into words so each one can fade in on scroll */
function SplitWords({ text }) {
  return text.split(" ").map((word, i) => (
    <span className="pd-word" key={i}>
      {word}{" "}
    </span>
  ));
}

/* Heading that slides up from behind a mask */
function Heading({ children, as: Tag = "h2" }) {
  return (
    <Tag className="pd-h">
      <span className="pd-mask">
        <span>{children}</span>
      </span>
    </Tag>
  );
}

export default function ProjectDetail({
  project,
  nextProject,
  onClose,
  onOpenNext,
}) {
  const scrollerRef = useRef(null);
  const rootRef = useRef(null);

  /* per-section images (optional): hero, discovery, innerWorld, visual[], execution[] */
  const imgs = project.images || {};
  const gallery = imgs.execution?.length
    ? imgs.execution
    : project.gallery?.length
      ? project.gallery
      : [project.image, project.secondaryImage || project.image, project.image];
  const discoveryImg = imgs.discovery || project.secondaryImage || project.image;
  const innerImg = imgs.innerWorld;
  const logoImgs = imgs.visual || [];

  /* accept both discovery / Discovery style keys */
  const discovery = project.discovery || project.Discovery || project.overview;
  const innerWorld =
    project.innerWorld || project.InnerWorld || project.overview;
  const visualWorld =
    project.visualWorld || project.VisualWorld || project.overview;
  const execution =
    project.execution ||
    project.Execution ||
    "The system shipped across every touchpoint, one set of rules carrying the identity from screen to print to packaging.";

  /* lock body scroll + Escape to close */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  /* all scroll animations */
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const q = gsap.utils.selector(rootRef.current);
    const base = { scroller };
    scroller.scrollTop = 0;

    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      /* 0. reading progress bar */
      gsap.to(q(".pd-progress-bar"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          ...base,
          trigger: q(".pd-page")[0],
          start: "top top",
          end: "bottom bottom",
          scrub: 0.2,
        },
      });

      /* 1. hero intro */
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(q(".pd-hero-line > span"), {
        yPercent: 115,
        duration: 1.1,
        stagger: 0.12,
      })
        .from(
          q(".pd-hero-meta > *"),
          { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 },
          "-=0.7",
        )
        .from(
          q(".pd-hero-img"),
          { scale: 1.35, duration: 1.8, ease: "power3.out" },
          "-=1.2",
        );

      /* hero image grows from a framed card to full-bleed */
      gsap.fromTo(
        q(".pd-hero-stage"),
        { clipPath: "inset(0% 16% 0% 16% round 28px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          ease: "none",
          scrollTrigger: {
            ...base,
            trigger: q(".pd-hero-stage")[0],
            start: "top 88%",
            end: "top 8%",
            scrub: true,
          },
        },
      );
      gsap.to(q(".pd-hero-img"), {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          ...base,
          trigger: q(".pd-hero-stage")[0],
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      /* 2. headings slide up from mask */
      q(".pd-h").forEach((h) => {
        gsap.from(h.querySelector(".pd-mask > span"), {
          yPercent: 115,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: { ...base, trigger: h, start: "top 88%", once: true },
        });
      });

      /* 3. paragraphs: words light up as you scroll */
      q(".pd-split").forEach((block) => {
        gsap.fromTo(
          block.querySelectorAll(".pd-word"),
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.06,
            scrollTrigger: {
              ...base,
              trigger: block,
              start: "top 82%",
              end: "bottom 48%",
              scrub: true,
            },
          },
        );
      });

      /* 4. images: parallax + clip-path reveal */
      q(".pd-parallax").forEach((el) => {
        const img = el.querySelector("img");
        gsap.fromTo(
          img,
          { yPercent: -9 },
          {
            yPercent: 9,
            ease: "none",
            scrollTrigger: {
              ...base,
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        gsap.fromTo(
          el,
          { clipPath: "inset(14% 8% 14% 8%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              ...base,
              trigger: el,
              start: "top 96%",
              end: "top 38%",
              scrub: true,
            },
          },
        );
      });

      /* 5. dark "visual world" panel opens up */
      gsap.fromTo(
        q(".pd-dark"),
        { clipPath: "inset(0% 4% 0% 4% round 64px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          ease: "none",
          scrollTrigger: {
            ...base,
            trigger: q(".pd-dark")[0],
            start: "top 96%",
            end: "top 35%",
            scrub: true,
          },
        },
      );

      /* colour swatches rise one after the other */
      gsap.from(q(".pd-swatch"), {
        scaleY: 0,
        transformOrigin: "bottom center",
        duration: 1.1,
        stagger: 0.13,
        ease: "power3.out",
        scrollTrigger: {
          ...base,
          trigger: q(".pd-palette")[0],
          start: "top 85%",
          once: true,
        },
      });

      /* type specimen scales and straightens */
      gsap.fromTo(
        q(".pd-type-sample"),
        { scale: 0.65, rotate: -7 },
        {
          scale: 1,
          rotate: 0,
          ease: "none",
          scrollTrigger: {
            ...base,
            trigger: q(".pd-type")[0],
            start: "top 90%",
            end: "top 30%",
            scrub: true,
          },
        },
      );

      /* generic fade-ups */
      q(".pd-fade").forEach((el) => {
        gsap.from(el, {
          y: 44,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { ...base, trigger: el, start: "top 90%", once: true },
        });
      });

      /* deliverables stagger in */
      gsap.from(q(".pd-deliverable"), {
        x: -40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          ...base,
          trigger: q(".pd-deliverables")[0],
          start: "top 82%",
          once: true,
        },
      });

      /* next project: giant name drifts sideways */
      gsap.fromTo(
        q(".pd-next-name"),
        { xPercent: 10 },
        {
          xPercent: -10,
          ease: "none",
          scrollTrigger: {
            ...base,
            trigger: q(".pd-next")[0],
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
    }, rootRef);

    /* 6. desktop only: pinned horizontal gallery */
    mm.add("(min-width: 761px)", () => {
      const track = q(".pd-track")[0];
      if (!track) return;
      const distance = () => Math.max(0, track.scrollWidth - scroller.clientWidth);
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          ...base,
          trigger: q(".pd-hscroll")[0],
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    });

    /* recalc once images have their real height */
    const refresh = gsap.delayedCall(0.15, () => ScrollTrigger.refresh());
    refresh.pause();
    scroller.querySelectorAll("img").forEach((img) => {
      if (!img.complete)
        img.addEventListener("load", () => refresh.restart(true), { once: true });
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      refresh.kill();
      mm.revert();
      ctx.revert();
    };
  }, [project]);

  const [c1, c2, c3, c4] = project.palette.map((c) => c.hex);

  return (
    <div
      ref={scrollerRef}
      className="pd-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} case study`}
      style={{ "--c1": c1, "--c2": c2, "--c3": c3, "--c4": c4 }}
    >
      <div className="pd-progress">
        <div className="pd-progress-bar" />
      </div>

      <div className="pd-topbar">
        <span className="pd-topbar-mark">
          CASE STUDY / {project.number} <span>®</span>
        </span>
        <button type="button" className="pd-close" onClick={onClose}>
          Close <X size={18} />
        </button>
      </div>

      <div ref={rootRef} className="pd-page">
        {/* HERO */}
        <section className="pd-hero">
          <div className="pd-hero-head">
            <h1 className="pd-hero-title">
              <span className="pd-hero-line">
                <span>{project.name}</span>
              </span>
              <span className="pd-hero-line">
                <span className="pd-hero-sub">{project.description}</span>
              </span>
            </h1>
            <div className="pd-hero-meta">
              <span>{project.year}</span>
              {project.category.split(" · ").map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
          <div className="pd-hero-stage">
            <img
              className="pd-hero-img"
              src={imgs.hero || project.image}
              alt={`${project.name} cover`}
            />
          </div>
        </section>

        {/* DISCOVERY */}
        <section className="pd-section pd-two">
          <Heading>Discovery</Heading>
          <p className="pd-copy pd-split">
            <SplitWords text={discovery} />
          </p>
        </section>

        <div className="pd-bleed pd-parallax">
          <img src={discoveryImg} alt={`${project.name} discovery`} loading="lazy" />
        </div>

        {/* INNER WORLD */}
        <section className="pd-section pd-two">
          <Heading>Inner world</Heading>
          <p className="pd-copy pd-split">
            <SplitWords text={innerWorld} />
          </p>
        </section>

        {innerImg && (
          <div className="pd-bleed pd-bleed-short pd-parallax">
            <img
              src={innerImg}
              alt={`${project.name} brand story`}
              loading="lazy"
            />
          </div>
        )}

        {/* VISUAL WORLD */}
        <section className="pd-dark">
          <div className="pd-section pd-two">
            <Heading>Visual world</Heading>
            <p className="pd-copy pd-split">
              <SplitWords text={visualWorld} />
            </p>
          </div>

          {logoImgs.length > 0 && (
            <div className="pd-logos">
              {logoImgs.map((src, i) => (
                <div className="pd-logo-tile pd-fade" key={i}>
                  <img
                    src={src}
                    alt={`${project.name} logo variation ${i + 1}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="pd-palette-wrap">
            <p className="pd-label pd-fade">COLOUR SYSTEM</p>
            <div className="pd-palette">
              {project.palette.map((c) => (
                <div className="pd-colour" key={c.hex}>
                  <div
                    className="pd-swatch"
                    style={{ backgroundColor: c.hex }}
                  />
                  <strong>{c.name}</strong>
                  <span>{c.hex}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pd-type pd-section">
            <div className="pd-type-sample">
              Ag<span>Rr</span>
            </div>
            <div className="pd-fade">
              <p className="pd-label">TYPOGRAPHY</p>
              <p className="pd-type-copy">{project.typography}</p>
            </div>
          </div>
        </section>

        {/* EXECUTION */}
        <section className="pd-section pd-two pd-exec">
          <Heading>Execution</Heading>
          <p className="pd-copy pd-split">
            <SplitWords text={execution} />
          </p>
        </section>

        <section className="pd-hscroll">
          <div className="pd-track">
            {gallery.map((src, i) => (
              <figure className="pd-slide" key={i}>
                <img src={src} alt={`${project.name} application ${i + 1}`} />
                <figcaption>
                  0{i + 1} / 0{gallery.length}
                </figcaption>
              </figure>
            ))}
            <div className="pd-slide pd-slide-mark">
              <span>{project.name.slice(0, 1)}</span>
              <strong>
                {project.name}
                <sup>®</sup>
              </strong>
            </div>
          </div>
        </section>

        {/* DELIVERABLES */}
        <section className="pd-section pd-deliverables">
          <p className="pd-label pd-fade">BRAND TOOLKIT</p>
          <div className="pd-deliverable-list">
            {project.deliverables.map((item, i) => (
              <div className="pd-deliverable" key={item}>
                <span>0{i + 1}</span>
                <strong>{item}</strong>
                <ArrowUpRight size={18} />
              </div>
            ))}
          </div>
        </section>

        {/* NEXT PROJECT */}
        <section className="pd-next">
          <p className="pd-label">NEXT PROJECT</p>
          <button
            type="button"
            className="pd-next-btn"
            onClick={() => onOpenNext(nextProject)}
          >
            <span className="pd-next-name">{nextProject.name}</span>
          </button>
          <button type="button" className="pd-back" onClick={onClose}>
            Back to all projects <ArrowUpRight size={17} />
          </button>
        </section>
      </div>
    </div>
  );
}