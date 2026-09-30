"use client";

import { useEffect, useRef, useState } from "react";
import { assetPath } from "../asset-path";
import LabLogo from "../lab-logo";

const links = [
  ["Research", "/#artifacts"], ["Approach", "/#vision"],
  ["People", "/#people"], ["Publications", "/#papers"],
  ["News", "/news/"], ["Blog", "/blog/"],
];

export function EditorialHeader({ active }: { active: "news" | "blog" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const closeOnResize = () => setMenuOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOutside);
    window.addEventListener("resize", closeOnResize);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [menuOpen]);

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header ref={headerRef} className="site-header is-scrolled editorial-header" data-navigation="full">
      <nav className="nav-shell" aria-label="Primary navigation">
        <a className="brand" href={assetPath("/")}>
          <LabLogo className="brand-mark" />
          <span className="brand-copy"><span className="brand-name">Technology <span className="brand-name-tail">Innovation Lab</span></span><span className="brand-affiliation">A lab in the making</span></span>
        </a>
        <div id="primary-links" className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          {links.map(([label, href]) => <a key={href} href={assetPath(href)} aria-current={label.toLowerCase() === active ? "page" : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a className="mobile-join" href={assetPath("/#join")}>Get in touch <span className="arrow-icon" aria-hidden="true" /></a>
        </div>
        <div className="nav-actions">
          <a className="nav-cta" href={assetPath("/#join")}>Get in touch <span className="arrow-icon" aria-hidden="true" /></a>
          <button ref={buttonRef} type="button" className="menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="primary-links" onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        </div>
      </nav>
    </header>
  </>;
}

export function EditorialFooter() {
  return <footer className="site-footer">
    <div className="page-width footer-grid">
      <div><a className="footer-brand" href={assetPath("/")}><LabLogo className="footer-brand-mark" /><span className="footer-brand-copy">Technology<br />Innovation Lab <span className="footer-brand-affiliation">A lab in the making</span></span></a></div>
      <div><p className="footer-label">Explore</p>{links.filter(([label]) => label !== "Approach").map(([label, href]) => <a key={href} href={assetPath(href)}>{label}</a>)}<a href={assetPath("/#join")}>Get in touch</a></div>
      <div><p className="footer-label">Say hello</p><a href="mailto:ivr4003@med.cornell.edu">ivr4003@med.cornell.edu</a><p>Ivan Raimondi<br />Weill Cornell Medicine<br />New York, NY</p></div>
    </div>
    <div className="page-width footer-bottom"><span>Ivan Raimondi · Technology Innovation Lab</span><a href={assetPath("/")}>Back to home <span aria-hidden="true">↗</span></a></div>
  </footer>;
}
