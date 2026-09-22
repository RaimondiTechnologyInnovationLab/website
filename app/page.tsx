"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import HeroBackground from "./hero-background";
import LabLogo from "./lab-logo";
import { assetPath } from "./asset-path";

const people = [
  {
    name: "Ivan Raimondi, PhD",
    role: "Director",
    future: false,
    specialty: "Technology invention",
    focus: "High-resolution genomic and multiomic tool building",
    mode: "Molecular invention / experimental design",
    summary:
      "Ivan develops genomic and multiomic methods for studying individual cells. This site brings together his research and his vision for a future Technology Innovation Lab.",
    signals: ["Genomics", "Multiomics", "Automation"],
    photo: assetPath("/raimondi-ivan-hires.png"),
  },
  {
    name: "Experimental scientist",
    role: "Future team",
    future: true,
    specialty: "Single-cell workflow design",
    focus: "Assay architecture for sparse and fragile samples",
    mode: "Experimental optimization",
    summary:
      "An envisioned role focused on developing and validating single-cell experiments, from sample preparation to reliable measurements. Interested in shaping this direction? Let’s start a conversation.",
    signals: ["Single-cell", "Assays", "Signal quality"],
    visualTitle: "Experiment.",
  },
  {
    name: "Molecular engineer",
    role: "Future team",
    future: true,
    specialty: "Molecular and protein engineering",
    focus: "New molecular tools for biological measurement",
    mode: "Design / build / validate",
    summary:
      "An envisioned role focused on designing molecular tools that make new biological measurements possible. Bring an interest in invention, molecular design, and turning an idea into an assay.",
    signals: ["Molecular tools", "Protein design", "Assays"],
    visualTitle: "Invent.",
  },
  {
    name: "Automation engineer",
    role: "Future team",
    future: true,
    specialty: "Robotic workflow engineering",
    focus: "Automation for sensitive molecular protocols",
    mode: "System calibration",
    summary:
      "An envisioned role focused on translating sensitive laboratory protocols into reproducible automated workflows. Help imagine how robotics and careful engineering could support the next generation of experiments.",
    signals: ["Robotics", "Instrumentation", "Reproducibility"],
    visualTitle: "Automate.",
  },
  {
    name: "Computational scientist",
    role: "Future team",
    future: true,
    specialty: "Computational genomics",
    focus: "Inference pipelines for high-dimensional datasets",
    mode: "Modeling / interpretation",
    summary:
      "An envisioned role focused on turning complex genomic and multiomic measurements into interpretable biological insights. Connect experimental questions with models, analysis, and new ways to understand the data.",
    signals: ["Inference", "Pipelines", "Data systems"],
    visualTitle: "Interpret.",
  },
];

const papers = [
  {
    number: "01",
    title: "Single-cell mapping of regulatory DNA-protein interactions",
    copy:
      "D&D-seq records weak and transient DNA-protein interactions in single cells while remaining compatible with standard multiomic workflows.",
    label: "Read in Cell / 2026",
    href: "https://doi.org/10.1016/j.cell.2026.05.014",
    year: "2026",
    category: "Single-cell / D&D-seq",
    journal: "Cell / Resource",
    cover: "cell",
    coverImage: assetPath("/cell-volume-189-issue-12.jpg"),
    coverAlt: "Cell Volume 189, Number 12 cover",
    coverCode: "D&D-seq",
    coverTitle: "Mapping regulatory DNA-protein interactions in single cells",
    issue: "Vol. 189 / No. 12",
    doi: "10.1016/j.cell.2026.05.014",
  },
  {
    number: "02",
    title: "Nanobody-tethered transposition enables multifactorial chromatin profiling at single-cell resolution",
    copy:
      "NTT-seq measures multiple chromatin features together, creating high-resolution single-cell maps of histone marks and protein-DNA binding.",
    label: "Read in Nature Biotechnology / 2023",
    href: "https://www.nature.com/articles/s41587-022-01588-5",
    year: "2023",
    category: "Multiomic / NTT-seq",
    journal: "Nature Biotechnology / Article",
    cover: "nature",
    coverImage: assetPath("/nature-biotechnology-volume-41-issue-6.png"),
    coverAlt: "Nature Biotechnology Volume 41, Issue 6 cover",
    coverCode: "NTT-seq",
    coverTitle: "Multifactorial chromatin profiling at single-cell resolution",
    issue: "Vol. 41 / No. 6",
    doi: "10.1038/s41587-022-01588-5",
  },
  {
    number: "03",
    title: "Phylogenetic mapping in aging esophagus",
    copy:
      "SMART-PTA links genome and transcriptome in single cells to reconstruct clonal evolution across the human aging esophagus.",
    label: "Read preprint / 2025",
    href: "https://www.biorxiv.org/content/10.1101/2025.10.11.681805v1",
    year: "2025",
    category: "Lineage / SMART-PTA",
    journal: "bioRxiv / Preprint",
    cover: "biorxiv",
    coverImage: "",
    coverAlt: "SMART-PTA bioRxiv preprint cover",
    coverCode: "SMART-PTA",
    coverTitle: "Phylogenetic mapping across the aging human esophagus",
    issue: "Preprint / 2025",
    doi: "10.1101/2025.10.11.681805",
  },
];

const tracks = [
  {
    label: "Research conversations",
    title: "Exchange ideas about biological questions and the tools needed to answer them.",
  },
  {
    label: "Possible collaborations",
    title: "Discuss shared interests in molecular methods, single-cell measurements, or automation.",
  },
  {
    label: "Future team",
    title: "Introduce your interests and expertise as the vision for the lab develops.",
  },
];

const omicsLayers = [
  { label: "RNA", detail: "Expression", value: "0.82", clusters: [1, 2], clusterLabel: "02 + 03", signal: [3, 6, 4, 9, 7, 11] },
  { label: "ATAC", detail: "Accessibility", value: "0.91", clusters: [3, 4], clusterLabel: "04 + 05", signal: [7, 4, 10, 5, 12, 8] },
  { label: "Protein", detail: "Abundance", value: "0.76", clusters: [0, 3], clusterLabel: "01 + 04", signal: [4, 9, 6, 12, 8, 5] },
  { label: "DNA:Protein", detail: "Occupancy", value: "0.88", clusters: [0, 2, 4], clusterLabel: "01 + 03 + 05", signal: [8, 5, 11, 7, 4, 10] },
];

const umapClusters = [
  { x: 18, y: 31, rx: 11, ry: 17, count: 12 },
  { x: 43, y: 21, rx: 13, ry: 11, count: 13 },
  { x: 36, y: 63, rx: 16, ry: 14, count: 15 },
  { x: 68, y: 57, rx: 13, ry: 18, count: 14 },
  { x: 80, y: 25, rx: 9, ry: 12, count: 11 },
];

const umapCells = umapClusters.flatMap((cluster, clusterIndex) =>
  Array.from({ length: cluster.count }, (_, index) => {
    const angle = index * 2.399 + clusterIndex * 0.61;
    const radius = Math.sqrt((index + 1) / cluster.count);

    return {
      cluster: clusterIndex,
      x: Number(
        (cluster.x + Math.cos(angle) * cluster.rx * radius).toFixed(3),
      ),
      y: Number(
        (cluster.y + Math.sin(angle) * cluster.ry * radius).toFixed(3),
      ),
    };
  }),
);

const robotPhases = [
  { code: "01", label: "Prepare", detail: "Bring samples into a consistent, repeatable workflow." },
  { code: "02", label: "Process", detail: "Translate sensitive molecular protocols into automated steps." },
  { code: "03", label: "Measure", detail: "Connect experimental consistency with interpretable readouts." },
];

function Arrow() {
  return <span aria-hidden="true" className="arrow-icon" />;
}

function PublicationCover({
  kind,
  code,
  title,
  issue,
  doi,
  image,
  alt,
}: {
  kind: string;
  code: string;
  title: string;
  issue: string;
  doi: string;
  image: string;
  alt: string;
}) {
  return (
    <div className="publication-cover-stage">
      {image ? (
        <img className="publication-cover-real" src={image} alt={alt} />
      ) : (
        <div className={`publication-cover publication-cover-${kind}`}>
        <div className="cover-topline">
          <span>{issue}</span>
          <span>Not peer reviewed</span>
        </div>

        <div className="cover-masthead biorxiv-masthead">bioRxiv</div>
        <div className="biorxiv-cover-field">
          <span>PREPRINT</span>
          <strong>SMART-PTA</strong>
          <small>Genome + transcriptome</small>
        </div>

        <div className="cover-story">
          <span>{code}</span>
          <strong>{title}</strong>
        </div>
        <div className="cover-doi">DOI {doi}</div>
        </div>
      )}
    </div>
  );
}

const email = "ivr4003@med.cornell.edu";
const manifesto = "The goal is to build integrated technologies that increase biological signal, reduce experimental noise, and make complex measurement reproducible at scale.";

function subscribeMotionPreference(onChange: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function readMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function serverMotionPreference() { return true; }

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navigationVisible, setNavigationVisible] = useState(false);
  const [activePerson, setActivePerson] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [activeLayer, setActiveLayer] = useState(0);
  const [robotPhase, setRobotPhase] = useState(0);
  const prefersReducedMotion = useSyncExternalStore(subscribeMotionPreference, readMotionPreference, serverMotionPreference);
  const motionEnabled = !prefersReducedMotion;
  const layerPinned = useRef(false);
  const robotPinned = useRef(false);
  const personHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const person = people[activePerson];

  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, [menuOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !contactOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const dismissBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) setContactOpen(false);
    };
    dialog.addEventListener("click", dismissBackdrop);
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.removeEventListener("click", dismissBackdrop);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [contactOpen]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
    if (personHoverTimer.current) clearTimeout(personHoverTimer.current);
  }, []);

  useEffect(() => {
    const header = document.querySelector(".site-header");
    const hero = document.getElementById("home");
    let headerFrame = 0;
    const updateHeader = () => {
      headerFrame = 0;
      header?.classList.toggle("is-scrolled", window.scrollY > 48);
      const pastHero = hero ? hero.getBoundingClientRect().bottom <= 0 : true;
      setNavigationVisible(pastHero);
      if (!pastHero) {
        setMenuOpen(false);
        // Returning to the hero must not leave keyboard focus in hidden navigation.
        if (header?.querySelector(".nav-links")?.contains(document.activeElement)
          || document.activeElement === menuRef.current) {
          header?.querySelector<HTMLAnchorElement>(".brand")?.focus({ preventScroll: true });
        }
      }
    };
    const scheduleHeader = () => {
      if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
    };
    updateHeader();
    window.addEventListener("scroll", scheduleHeader, { passive: true });
    window.addEventListener("resize", scheduleHeader);
    window.addEventListener("pageshow", scheduleHeader);
    const heroSize = new ResizeObserver(scheduleHeader);
    if (hero) heroSize.observe(hero);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!reducedMotion.matches) entry.target.classList.add("enter-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    return () => {
      cancelAnimationFrame(headerFrame);
      window.removeEventListener("scroll", scheduleHeader);
      window.removeEventListener("resize", scheduleHeader);
      window.removeEventListener("pageshow", scheduleHeader);
      heroSize.disconnect();
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const section = document.querySelector<HTMLElement>("#artifacts");
    if (!section) return;
    let visible = false;
    let layerTimer: ReturnType<typeof setInterval> | undefined;
    let robotTimer: ReturnType<typeof setInterval> | undefined;
    const clearTimers = () => {
      clearInterval(layerTimer);
      clearInterval(robotTimer);
    };
    const syncPlayback = () => {
      clearTimers();
      const playing = motionEnabled && visible && !document.hidden;
      section.dataset.playing = String(playing);
      if (!playing) return;
      layerTimer = setInterval(() => {
        if (!layerPinned.current && !section.querySelector(".multiomics-card")?.matches(":focus-within")) {
          setActiveLayer((current) => (current + 1) % omicsLayers.length);
        }
      }, 1900);
      robotTimer = setInterval(() => {
        if (!robotPinned.current && !section.querySelector(".robotics-card")?.matches(":focus-within")) {
          setRobotPhase((current) => (current + 1) % robotPhases.length);
        }
      }, 2400);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(section);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      clearTimers();
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      section.dataset.playing = "false";
    };
  }, [motionEnabled]);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    const vision = document.querySelector<HTMLElement>("#vision");
    const visionContent = vision?.querySelector<HTMLElement>(".vision-content");
    const words = Array.from(document.querySelectorAll<HTMLElement>("[data-vision-word]"));
    let frame = 0;
    let stickyTop = 0;
    let stickyTravel = 0;
    let isSticky = false;
    const measure = () => {
      if (!vision || !visionContent) return;
      const layout = getComputedStyle(visionContent);
      stickyTop = parseFloat(layout.top) || 0;
      stickyTravel = vision.offsetHeight - visionContent.offsetHeight;
      isSticky = layout.position === "sticky" && stickyTravel > 0;
    };
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const bounds = vision?.getBoundingClientRect();
      // Let the words light up while the manifesto is held in view.
      const travel = bounds ? (isSticky
        ? (stickyTop - bounds.top) / stickyTravel
        : (viewport * .6 - bounds.top) / Math.max(bounds.height - viewport * .1, viewport * .4)) : 1;
      const progress = Math.max(0, Math.min(1, travel));
      hero?.style.setProperty("--hero-drift", `${motionEnabled ? Math.min(window.scrollY * .09, 68) : 0}px`);
      words.forEach((word, index) => {
        const local = Math.max(0, Math.min(1, (progress - index / Math.max(words.length - 1, 1) * .8) / .12));
        word.style.setProperty("--word-reveal", String(motionEnabled ? local : 1));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = () => { measure(); schedule(); };
    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
    };
  }, [motionEnabled]);

  const cancelPersonPreview = () => {
    if (personHoverTimer.current) clearTimeout(personHoverTimer.current);
  };

  const selectPerson = (index: number) => {
    cancelPersonPreview();
    setActivePerson(index);
  };

  const openContact = () => {
    setCopyStatus("");
    setMenuOpen(false);
    setContactOpen(true);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopyStatus("Email address copied.");
    } catch {
      setCopyStatus("Select the address above to copy it, or use Email Ivan.");
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyStatus(""), 5000);
  };

  return (
    <div className="site-shell" data-intro="cinematic" data-motion={motionEnabled ? "on" : "off"}>
      <noscript><style>{`html .site-shell[data-intro="cinematic"] :is(.nav-shell, .hero .eyebrow, .hero h1, .hero-body, .hero-bottom) { animation: none !important; opacity: 1 !important; visibility: visible !important; transform: none !important; }`}</style></noscript>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header" data-navigation={navigationVisible ? "full" : "intro"}>
        <nav className="nav-shell" aria-label="Primary navigation">
          <a className="brand" href="#home" onClick={() => setMenuOpen(false)}>
            <LabLogo className="brand-mark" />
            <span className="brand-copy">
              <span className="brand-name">Technology <span className="brand-name-tail">Innovation Lab</span></span>
              <span className="brand-affiliation">A lab in the making</span>
            </span>
          </a>
          <div id="primary-links" className={`nav-links ${menuOpen ? "is-open" : ""}`}
            inert={!navigationVisible} aria-hidden={!navigationVisible}>
            {[["Research", "#artifacts"], ["Approach", "#vision"], ["People", "#people"], ["Publications", "#papers"]].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <a className="mobile-join" href="#join" onClick={() => setMenuOpen(false)}>Get in touch <Arrow /></a>
          </div>
          <div className="nav-actions">
            <a className="nav-cta" href="#join">Get in touch <Arrow /></a>
            <button ref={menuRef} type="button" className="menu-toggle"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen} aria-controls="primary-links"
              disabled={!navigationVisible}
              onClick={() => setMenuOpen((open) => !open)}>
              <span /><span />
            </button>
          </div>
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        <section id="home" className="hero">
          <HeroBackground variant="cells" motionEnabled={motionEnabled} />
          <div className="hero-content page-width">
            <div className="hero-copy" role="region" aria-label="Lab introduction" tabIndex={0}>
              <p className="eyebrow light">Genomics. Multiomics. Automation.</p>
              <h1><span className="hero-lead">Imagining what biology needs</span><em>Next...</em></h1>
              <p className="hero-body">Building technologies to make the unseen measurable.</p>
            </div>
            <div className="hero-bottom">
              <div className="institutional-affiliation" aria-label="Ivan Raimondi’s institutional affiliation: Weill Cornell Medicine">
                <img src={assetPath("/wcm-official-white.png")} alt="Weill Cornell Medicine" width="660" height="64" />
              </div>
            </div>
          </div>
        </section>

        <a className="research-highlight" href="#paper-dd-seq">
          <div className="page-width highlight-layout">
            <span className="highlight-label">In focus <span>Cell · 2026</span></span>
            <span className="highlight-title"><strong>D&amp;D-seq</strong> Capturing DNA–protein interactions, one cell at a time.</span>
            <span className="highlight-action">Explore the work <Arrow /></span>
          </div>
        </a>

        <section id="artifacts" className="core-section page-width section-pad">
          <div className="section-heading split-heading" data-reveal>
            <div><p className="eyebrow">01 / Research</p><h2>New tools.<br /><em>New possibilities.</em></h2></div>
            <p>My research connects molecular invention, single-cell measurement, and automation to make difficult biological questions experimentally accessible.</p>
          </div>
          <div className="platform-grid">
            <article className="platform-card multiomics-card" data-reveal>
              <p className="card-topline">Single-cell systems</p>
              <div className="card-intro"><h3>Multiomics</h3><p>Read different layers of biology together, connecting the genome, its regulation, and gene expression in individual cells.</p></div>
              <div className="omics-console">
                <div className="omics-map" aria-hidden="true">
                  <div className="umap-plot">
                    <div className="umap-cells" key={activeLayer}>
                    {umapCells.map((cell, index) => (
                      <i key={index} className={`umap-cell ${omicsLayers[activeLayer].clusters.includes(cell.cluster) ? "highlighted" : ""}`}
                        style={{ "--cell-x": `${cell.x}%`, "--cell-y": `${cell.y}%`, "--cell-delay": `${index % 13 * 18}ms` } as React.CSSProperties} />
                    ))}
                    </div>
                  </div>
                  <div className="omics-fusion" key={activeLayer}>
                    <small>Single-cell UMAP</small>
                    <strong>{omicsLayers[activeLayer].label}</strong>
                    <span>{omicsLayers[activeLayer].detail}</span>
                  </div>
                </div>
                <div className="layer-stack" aria-label="Explore molecular layers">
                  {omicsLayers.map((layer, index) => (
                    <button key={layer.label} type="button" className={`omics-layer ${activeLayer === index ? "active" : ""}`}
                      aria-pressed={activeLayer === index} onClick={() => { layerPinned.current = true; setActiveLayer(index); }}>
                      <span className="layer-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="layer-meta"><strong>{layer.label}</strong><small>{layer.detail}</small></span>
                      <span className="layer-signal" aria-hidden="true">
                        {layer.signal.map((height, signalIndex) => <i key={signalIndex} style={{ "--signal-height": height, "--signal-delay": `${signalIndex * -140}ms` } as React.CSSProperties} />)}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="figure-note">Explore the layers · Illustrative single-cell map</p>
              </div>
            </article>
            <article className="platform-card assay-card" data-reveal>
              <p className="card-topline">Molecular invention</p>
              <div className="card-intro"><h3>Molecular R&amp;D</h3><p>Develop molecular and protein tools that make new measurements possible, beyond the limits of standard assays.</p></div>
              <figure className="protein-folding">
                <img src={assetPath("/protein-cartoon.png")} alt="Illustration of a folded protein structure" loading="lazy" width="640" height="640" />
                <figcaption>Protein design &amp; molecular tools</figcaption>
              </figure>
            </article>
            <article className="platform-card robotics-card" data-reveal>
              <p className="card-topline">Experimental engineering</p>
              <div className="card-intro"><h3>Robotics</h3><p>Turn sensitive protocols into repeatable workflows, bringing consistency from the first sample to the next experiment.</p></div>
              <div className="robot-console">
                <div className={`robot-stage phase-${robotPhase}`} aria-hidden="true">
                  <div className="robot-grid" />
                  <div className="automation-meta"><span>Experimental workflow</span><strong>{robotPhases[robotPhase].label}</strong></div>
                  <div className="robot-rail" />
                  <div className="scanner-beam" />
                  <div className="sample-carrier">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
                  <div className="robot-stations">{robotPhases.map((phase, index) => <span key={phase.code} className={robotPhase === index ? "active" : ""}><i>{phase.code}</i>{phase.label}</span>)}</div>
                </div>
                <div className="workflow-controls" aria-label="Explore workflow steps">
                  {robotPhases.map((phase, index) => (
                    <button key={phase.code} type="button" aria-pressed={robotPhase === index}
                      onClick={() => { robotPinned.current = true; setRobotPhase(index); }}>{phase.label}</button>
                  ))}
                </div>
                <p className="workflow-detail">{robotPhases[robotPhase].detail}</p>
                <p className="figure-note">Illustrative automated workflow</p>
              </div>
            </article>
          </div>
        </section>

        <section id="vision" className="vision-section">
          <div className="vision-grid" aria-hidden="true" />
          <div className="page-width vision-content">
            <p className="eyebrow light">02 / The approach</p>
            <h2 className="vision-manifesto" aria-label={manifesto}>
              {manifesto.split(" ").map((word, index) => (
                <span key={index} data-vision-word aria-hidden="true" className={/signal|complex/.test(word) ? "highlight" : ""}>{word}{" "}</span>
              ))}
            </h2>
          </div>
        </section>

        <section id="people" className="people-section section-pad">
          <div className="page-width">
            <div className="section-heading split-heading" data-reveal>
              <div><p className="eyebrow">03 / People</p><h2>Building<br />the team.</h2></div>
              <p>The Technology Innovation Lab is a vision in development, driven by the ambition to bring curious minds together at the intersection of biology, engineering, and AI to develop new tools for biological measurement.</p>
            </div>
            <p className="team-stage-note"><strong>A team to build.</strong> The four future roles describe a possible team structure, not current members or advertised positions.</p>
            <div className="people-layout">
              <article className="person-feature" id="person-profile" aria-label={person.name} key={person.name}>
                <div className="portrait-frame">
                  {person.photo ? <img src={person.photo} alt={person.name} loading="lazy" width="600" height="750" /> : <div className="future-role-portrait" aria-hidden="true"><LabLogo className="future-role-mark" /><div><span>A future direction</span><strong>{person.visualTitle}</strong><p>A role to shape,<br />together.</p></div></div>}
                  <div className="portrait-status"><span>{person.future ? "Future team" : "Ivan’s profile"}</span><span>{person.future ? "Vision in development" : "Research & invention"}</span></div>
                </div>
                <div className="person-copy">
                  <div>
                    <div className="person-index"><span>{String(activePerson + 1).padStart(2, "0")}</span><i aria-hidden="true" /><span>{person.role}</span></div>
                    <h3>{person.name.replace(", PhD", "")}<span>{person.name.includes("PhD") ? "PhD" : ""}</span></h3>
                    <p className="person-summary">{person.summary}</p>
                  </div>
                  <div>
                    <dl className="person-details">
                      <div><dt>{person.future ? "Research area" : "Specialty"}</dt><dd>{person.specialty}</dd></div>
                      <div><dt>{person.future ? "Potential focus" : "Current focus"}</dt><dd>{person.focus}</dd></div>
                      <div><dt>Research approach</dt><dd>{person.mode}</dd></div>
                    </dl>
                    <div className="signal-tags">{person.signals.map((signal) => <span key={signal}>{signal}</span>)}</div>
                    <button className="text-link" type="button" onClick={openContact}>{person.future ? "Introduce yourself" : "Get in touch"} <Arrow /></button>
                  </div>
                </div>
              </article>
              {people.length > 1 && <div className="people-list" aria-label="Ivan and future team roles">
                {people.map((member, index) => (
                  <button key={member.name} type="button" aria-pressed={activePerson === index} aria-controls="person-profile"
                    className={activePerson === index ? "active" : ""}
                    onPointerEnter={(event) => {
                      cancelPersonPreview();
                      if (event.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches) {
                        personHoverTimer.current = setTimeout(() => setActivePerson(index), 160);
                      }
                    }}
                    onPointerLeave={cancelPersonPreview} onFocus={() => selectPerson(index)} onClick={() => selectPerson(index)}>
                    <span><strong>{member.name}</strong><small>{member.role}</small></span>
                  </button>
                ))}
              </div>}
            </div>
          </div>
        </section>

        <section id="papers" className="papers-section section-pad">
          <div className="page-width">
            <div className="section-heading papers-heading" data-reveal>
              <div><p className="eyebrow">04 / Selected publications</p><h2>Ideas, put<br /><em>into practice.</em></h2></div>
              <p>Selected research<br />and methods.</p>
            </div>
            <div className="paper-list">
              {papers.map((paper, index) => (
                <article className={`paper-row ${index === 0 ? "paper-featured" : ""}`} key={paper.number}
                  id={index === 0 ? "paper-dd-seq" : undefined} data-reveal>
                  <div className="paper-register"><span className="paper-number">{paper.coverCode}</span><span>{paper.year}</span></div>
                  <div className="paper-copy">
                    <p className="paper-meta">{paper.journal}</p>
                    <h3><a href={paper.href} target="_blank" rel="noreferrer">{paper.title}</a></h3>
                    <p>{paper.copy}</p>
                    <a className="text-link" href={paper.href} target="_blank" rel="noreferrer">{paper.label.replace(" / ", " · ")} <Arrow /></a>
                  </div>
                  <a className="cover-link" href={paper.href} target="_blank" rel="noreferrer" aria-label={`Read ${paper.title}`}>
                    <PublicationCover kind={paper.cover} code={paper.coverCode} title={paper.coverTitle} issue={paper.issue}
                      doi={paper.doi} image={paper.coverImage} alt={paper.coverAlt} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="join" className="join-section section-pad">
          <div className="page-width join-content">
            <div className="join-intro" data-reveal>
              <p className="eyebrow light">05 / Let’s connect</p>
              <h2>What would you<br /><em>make possible?</em></h2>
              <p>Interested in the research direction? Contact me to exchange ideas, discuss a possible collaboration, or stay in touch as plans for the lab develop.</p>
              <p className="join-status-note">No positions are currently advertised. Expressions of interest are welcome.</p>
              <button className="button button-light" type="button" onClick={openContact}>Let’s start a conversation <Arrow /></button>
            </div>
            <div className="track-list">
              {tracks.map((track) => (
                <article key={track.label}>
                  <h3>{track.label}</h3><p>{track.title}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-grid">
          <div>
            <a className="footer-brand" href="#home">
              <LabLogo className="footer-brand-mark" />
              <span className="footer-brand-copy">Technology<br />Innovation Lab <span className="footer-brand-affiliation">A lab in the making</span></span>
            </a>
          </div>
          <div><p className="footer-label">Explore</p><a href="#artifacts">Research</a><a href="#people">People</a><a href="#papers">Publications</a><a href="#join">Get in touch</a></div>
          <div><p className="footer-label">Say hello</p><a href={`mailto:${email}`}>{email}</a><p>Ivan Raimondi<br />Weill Cornell Medicine<br />New York, NY</p></div>
        </div>
        <div className="page-width footer-bottom"><span>Ivan Raimondi · Technology Innovation Lab</span><a href="#home">Back to top ↑</a></div>
      </footer>

      <dialog ref={dialogRef} className="contact-modal" aria-labelledby="contact-title" aria-describedby="contact-description"
        onCancel={() => setContactOpen(false)} onClose={() => setContactOpen(false)}>
        <div className="contact-inner">
          <button className="modal-close" type="button" onClick={() => setContactOpen(false)} aria-label="Close contact panel">×</button>
          <p className="eyebrow">Get in touch</p><h2 id="contact-title">Good science starts<br />with a conversation.</h2>
          <p id="contact-description">For questions about my research, possible collaborations, or the future lab, get in touch. Expressions of interest are welcome; no positions are currently advertised.</p>
          <a className="contact-address" href={`mailto:${email}`}>{email}</a>
          <div className="contact-actions"><a className="button button-dark" href={`mailto:${email}`}>Email Ivan <Arrow /></a>
            <button className="text-link" type="button" onClick={copyEmail}>Copy email</button></div>
          <p className="copy-status" role="status">{copyStatus}</p>
        </div>
      </dialog>
    </div>
  );
}
