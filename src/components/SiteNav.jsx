import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, LockKeyhole, Menu, X } from "lucide-react";
import logo from "../assets/logo-cco.svg";
import { PROJECT_CATEGORIES } from "../config/projectCategories.js";

export default function SiteNav({ active }) {
  const [menu, setMenu] = useState(false);
  const [services, setServices] = useState(false);
  const ref = useRef(null);
  const isService = PROJECT_CATEGORIES.some((category) => category.slug === active);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        setServices(false);
        setMenu(false);
      }
    };
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setServices(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClick);
    };
  }, []);

  const close = () => {
    setMenu(false);
    setServices(false);
  };

  return (
    <header className="sn" ref={ref}>
      <a href="/" className="sn-brand" aria-label="CCO Creative Content Office, home">
        <img src={logo} alt="" />
        <span>
          CCO<small>Creative Content Office</small>
        </span>
      </a>

      <button
        className="sn-burger"
        aria-label={menu ? "Close menu" : "Open menu"}
        aria-expanded={menu}
        onClick={() => setMenu(!menu)}
      >
        {menu ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={`sn-links ${menu ? "is-open" : ""}`} aria-label="Main">
        <a href="/" aria-current={active === "about" ? "page" : undefined} onClick={close}>
          About
        </a>

        <div className={`sn-drop ${services ? "is-open" : ""} ${isService ? "is-active" : ""}`}>
          <button
            type="button"
            aria-expanded={services}
            aria-haspopup="true"
            onClick={() => setServices(!services)}
          >
            Services <ChevronDown size={15} />
          </button>
          <ul>
            {PROJECT_CATEGORIES.map((category) => (
              <li key={category.slug}>
                <a
                  href={`/${category.slug}`}
                  aria-current={active === category.slug ? "page" : undefined}
                  style={{ "--dot": category.color }}
                  onClick={close}
                >
                  {category.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <a href="/#contact" onClick={close}>Contact</a>
        <a
          href="/admin"
          className="sn-admin"
          aria-current={active === "admin" ? "page" : undefined}
          onClick={close}
        >
          <LockKeyhole size={13} /> Admin
        </a>
        <a href="/#contact" className="sn-cta" onClick={close}>
          Start a project <ArrowUpRight size={15} />
        </a>
      </nav>
    </header>
  );
}
