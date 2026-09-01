"use client";

import { useEffect, useState } from "react";

const people = [
  {
    name: "Ivan Raimondi, PhD",
    role: "Principal Investigator",
    specialty: "Technology invention",
    focus: "High-resolution genomic and multiomic tool building",
    mode: "Lab strategy / platform design",
    summary:
      "Leads technology invention across genomics, multiomics, and automation systems, setting the scientific direction for the lab's platform work.",
    signals: ["Genomics", "Multiomics", "Automation"],
    photo: "/raimondi-ivan-hires.png",
  },
  {
    name: "Lena Hart",
    role: "Senior Scientist, Single-Cell Systems",
    specialty: "Single-cell workflow design",
    focus: "Assay architecture for sparse and fragile samples",
    mode: "Experimental optimization",
    summary:
      "Designs single-cell workflows that connect assay sensitivity with experimental robustness, translating difficult biology into stable measurements.",
    signals: ["Single-cell", "Assays", "Signal quality"],
    initials: "LH",
  },
  {
    name: "Milo Chen",
    role: "Staff Scientist, Multiomic Methods",
    specialty: "Multiomic assay development",
    focus: "Integrated readouts across chromatin and expression",
    mode: "Method invention",
    summary:
      "Builds and validates multiomic assays that combine regulatory, transcriptional, and phenotypic readouts into one coherent experimental surface.",
    signals: ["Chromatin", "RNA", "Integrated profiling"],
    initials: "MC",
  },
  {
    name: "Nora Velez",
    role: "Automation Engineer",
    specialty: "Robotic workflow engineering",
    focus: "Automation for sensitive molecular protocols",
    mode: "System calibration",
    summary:
      "Turns delicate laboratory protocols into reproducible robotic routines, reducing variance and scaling throughput without losing experimental nuance.",
    signals: ["Robotics", "Instrumentation", "Reproducibility"],
    initials: "NV",
  },
  {
    name: "Theo Mercer",
    role: "Computational Genomics Lead",
    specialty: "Computational genomics",
    focus: "Inference pipelines for high-dimensional datasets",
    mode: "Modeling / interpretation",
    summary:
      "Builds analysis systems that keep complex measurements interpretable, linking raw readouts to decision-ready biological signal.",
    signals: ["Inference", "Pipelines", "Data systems"],
    initials: "TM",
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
    coverImage: "/cell-volume-189-issue-12.jpg",
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
    coverImage: "/nature-biotechnology-volume-41-issue-6.png",
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
    label: "Read preprint / 2025.10.11",
    href: "https://www.biorxiv.org/content/10.1101/2025.10.11.681805v1",
    year: "2025",
    category: "Lineage / SMART-PTA",
    journal: "bioRxiv / Preprint",
    cover: "biorxiv",
    coverImage: "",
    coverAlt: "SMART-PTA bioRxiv preprint cover",
    coverCode: "SMART-PTA",
    coverTitle: "Phylogenetic mapping across the aging human esophagus",
    issue: "Posted / 11 Oct 2025",
    doi: "10.1101/2025.10.11.681805",
  },
];

const tracks = [
  {
    label: "PhD Track",
    status: "Open",
    count: "02 openings",
    title: "Train where genomics, multiomics, and automation converge.",
  },
  {
    label: "Postdoc Track",
    status: "Open",
    count: "01 opening",
    title: "Lead a frontier program from first sketch to first preprint.",
  },
  {
    label: "Visiting / Rotation",
    status: "Selective",
    count: "Limited",
    title: "Join a live research engine and test the fit in motion.",
  },
];

const manifesto =
  "We build integrated technologies that increase biological signal, reduce experimental noise, and make complex measurement reproducible at scale.";
const manifestoWords = manifesto.split(" ");

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
  { code: "01", label: "Load", detail: "Plate registered" },
  { code: "02", label: "Process", detail: "384 wells processing" },
  { code: "03", label: "Read", detail: "Signal acquired" },
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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePerson, setActivePerson] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeLayer, setActiveLayer] = useState(0);
  const [robotPhase, setRobotPhase] = useState(0);
  const person = people[activePerson];

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const layerTimer = window.setInterval(
      () => setActiveLayer((current) => (current + 1) % omicsLayers.length),
      1900,
    );
    const robotTimer = window.setInterval(
      () => setRobotPhase((current) => (current + 1) % robotPhases.length),
      2400,
    );

    return () => {
      window.clearInterval(layerTimer);
      window.clearInterval(robotTimer);
    };
  }, []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setContactOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const reveals = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const visionSection = document.querySelector<HTMLElement>("#vision");
    const visionWords = Array.from(
      document.querySelectorAll<HTMLElement>("[data-vision-word]"),
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      reveals.forEach((node) => node.classList.add("is-visible"));
      visionWords.forEach((word) => {
        word.style.opacity = "1";
        word.style.transform = "none";
        word.style.filter = "none";
      });
      root.style.setProperty("--vision-bar-progress", "1");
      return;
    }

    root.classList.add("motion-ready");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -7% 0px" },
    );

    reveals.forEach((node) => revealObserver.observe(node));

    let scrollFrame = 0;
    const updateScrollMotion = () => {
      scrollFrame = 0;
      const scrollY = window.scrollY;
      const viewport = Math.max(window.innerHeight, 1);
      const pageRange = Math.max(
        document.documentElement.scrollHeight - viewport,
        1,
      );
      const heroProgress = Math.min(scrollY / viewport, 1);
      const visionBounds = visionSection?.getBoundingClientRect();
      const visionScrollRange = visionSection
        ? Math.max(visionSection.offsetHeight - viewport, 1)
        : 1;
      const visionProgress = visionBounds
        ? Math.max(
            0,
            Math.min(
              (viewport * 0.06 - visionBounds.top) / visionScrollRange,
              1,
            ),
          )
        : 0;

      root.style.setProperty(
        "--page-progress",
        `${Math.min(scrollY / pageRange, 1)}`,
      );
      root.style.setProperty(
        "--hero-copy-shift",
        `${Math.min(scrollY * 0.08, 54)}px`,
      );
      root.style.setProperty("--hero-fade", `${1 - heroProgress * 0.58}`);
      root.style.setProperty("--grid-shift", `${scrollY * 0.035}px`);
      root.style.setProperty(
        "--vision-bar-progress",
        `${Math.max(0, Math.min((visionProgress - 0.05) / 0.88, 1))}`,
      );

      visionWords.forEach((word, index) => {
        const wordStart =
          (index / Math.max(visionWords.length, 1)) * 0.86;
        const localProgress = Math.max(
          0,
          Math.min((visionProgress - wordStart) / 0.11, 1),
        );
        const eased =
          localProgress *
          localProgress *
          localProgress *
          (localProgress * (localProgress * 6 - 15) + 10);

        word.style.opacity = `${0.12 + eased * 0.88}`;
        word.style.transform = `translate3d(0, ${(1 - eased) * 12}px, 0)`;
        word.style.filter = `blur(${(1 - eased) * 1.2}px)`;
      });
      document
        .querySelector(".site-header")
        ?.classList.toggle("is-scrolled", scrollY > 36);
    };

    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateScrollMotion);
    };

    const magneticItems = Array.from(
      document.querySelectorAll<HTMLElement>(".button, .nav-cta"),
    );
    const magneticListeners = magneticItems.map((item) => {
      const move = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        const bounds = item.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        item.style.setProperty("--mag-x", `${x * 10}px`);
        item.style.setProperty("--mag-y", `${y * 8}px`);
      };
      const leave = () => {
        item.style.setProperty("--mag-x", "0px");
        item.style.setProperty("--mag-y", "0px");
      };
      item.addEventListener("pointermove", move);
      item.addEventListener("pointerleave", leave);
      return { item, move, leave };
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollMotion();

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      magneticListeners.forEach(({ item, move, leave }) => {
        item.removeEventListener("pointermove", move);
        item.removeEventListener("pointerleave", leave);
      });
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      root.classList.remove("motion-ready");
    };
  }, []);

  const copyEmail = async () => {
    await navigator.clipboard.writeText("ivr4003@med.cornell.edu");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="site-shell">
      <svg className="noise-defs" aria-hidden="true">
        <filter id="site-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.86"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
      </svg>
      <div className="noise-overlay" aria-hidden="true" />
      <div className="page-progress" aria-hidden="true" />
      <header className="site-header">
        <nav className="nav-shell" aria-label="Primary navigation">
          <a className="brand" href="#home" onClick={() => setMenuOpen(false)}>
            Technology Innovation Lab <span>@ SCB</span>
          </a>
          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
          <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
            {[
              ["Core", "#artifacts"],
              ["Vision", "#vision"],
              ["People", "#people"],
              ["Papers", "#papers"],
            ].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </div>
          <a className="nav-cta" href="#join">
            Join the Lab <Arrow />
          </a>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-image" />
          <div className="hero-shade" />
          <div className="hero-content page-width">
            <div className="hero-copy">
              <p className="eyebrow light">Innovation / Genomics / Automation</p>
              <p className="hero-lead">Imagining what biology needs</p>
              <h1>Next...</h1>
              <p className="hero-body">
                We invent genomic, multiomic, and automated technologies for
                higher-resolution biological discovery.
              </p>
            </div>
            <div className="hero-bottom">
              <div className="hero-actions">
                <a className="button button-light" href="#artifacts">
                  Explore Projects <Arrow />
                </a>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setContactOpen(true)}
                >
                  Contact the Lab <Arrow />
                </button>
              </div>
              <div
                className="institutional-affiliation"
                aria-label="Institutional affiliation: Weill Cornell Medicine"
              >
                <img
                  src="/wcm-official-white.png"
                  alt="Weill Cornell Medicine"
                  width="660"
                  height="64"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="artifacts" className="core-section page-width section-pad">
          <div className="section-heading" data-reveal="heading">
            <p className="eyebrow">Core Platforms</p>
            <h2>From molecular invention to scalable platforms.</h2>
          </div>
          <div className="platform-grid">
            <article className="platform-card multiomics-card" data-reveal="card">
              <div className="card-topline">
                <span>01 / Single-cell</span>
                <span className="signal-dot" />
              </div>
              <div className="card-intro">
                <h3>Multiomics</h3>
                <p>
                  Integrated genomic technologies to map genotype, regulation,
                  and phenotype at single-cell resolution.
                </p>
              </div>
              <div className="omics-console">
                <div className="omics-map" aria-hidden="true">
                  <div className="umap-plot">
                    <span className="umap-axis umap-axis-x">UMAP 1</span>
                    <span className="umap-axis umap-axis-y">UMAP 2</span>
                    <div className="umap-cells" key={activeLayer}>
                      {umapCells.map((cell, index) => (
                        <i
                          key={`${cell.cluster}-${index}`}
                          className={`umap-cell ${
                            omicsLayers[activeLayer].clusters.includes(cell.cluster)
                              ? "highlighted"
                              : ""
                          }`}
                          style={
                            {
                              "--cell-x": `${cell.x}%`,
                              "--cell-y": `${cell.y}%`,
                              "--cell-delay": `${(index % 13) * 18}ms`,
                            } as React.CSSProperties
                          }
                        />
                      ))}
                    </div>
                    {umapClusters.map((cluster, index) => (
                      <span
                        key={index}
                        className={`umap-cluster-label label-${index + 1}`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    ))}
                  </div>
                  <div className="omics-fusion">
                    <small>Single-cell UMAP</small>
                    <strong className={omicsLayers[activeLayer].label.length > 8 ? "long" : ""}>
                      {omicsLayers[activeLayer].label}
                    </strong>
                    <span>Clusters {omicsLayers[activeLayer].clusterLabel}</span>
                    <b key={activeLayer}>
                      {omicsLayers[activeLayer].detail} / {omicsLayers[activeLayer].value}
                    </b>
                  </div>
                </div>
                <div className="layer-stack" aria-label="Multiomic signal layers">
                  {omicsLayers.map((layer, index) => (
                    <button
                      key={layer.label}
                      type="button"
                      className={`omics-layer layer-${index + 1} ${
                        activeLayer === index ? "active" : ""
                      }`}
                      aria-pressed={activeLayer === index}
                      onClick={() => setActiveLayer(index)}
                    >
                      <span className="layer-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="layer-meta">
                        <span className="layer-name">{layer.label}</span>
                        <small>{layer.detail}</small>
                      </span>
                      <span className="layer-signal" aria-hidden="true">
                        {layer.signal.map((height, signalIndex) => (
                          <i
                            key={signalIndex}
                            style={{ "--signal-height": height } as React.CSSProperties}
                          />
                        ))}
                      </span>
                      <strong className="layer-value">{layer.value}</strong>
                    </button>
                  ))}
                </div>
              </div>
            </article>

            <article className="platform-card assay-card" data-reveal="card" data-delay="1">
              <div className="card-topline">
                <span>02 / Molecular Systems</span>
                <span>Live Trajectory</span>
              </div>
              <div className="card-intro">
                <h3>Molecular R&amp;D</h3>
                <p>
                  New molecular and protein technologies built to create
                  function and reveal biology beyond standard workflows.
                </p>
              </div>
              <figure
                className="protein-folding"
                aria-label="Stylized animated protein structure"
              >
                <span className="protein-motion" aria-hidden="true" />
                <figcaption>
                  <span>Molecular R&amp;D</span>
                  <strong>Engineered protein model</strong>
                </figcaption>
              </figure>
              <div className="protein-feed">
                <span className="live-indicator" />
                <span>Structure exploration active</span>
              </div>
              <p className="data-readout">Protein design / molecular modeling</p>
            </article>

            <article className="platform-card robotics-card" data-reveal="card" data-delay="2">
              <div className="card-topline">
                <span>03 / Automation</span>
                <span>Queue Active</span>
              </div>
              <div className="card-intro">
                <h3>Robotics</h3>
                <p>
                  Automated experimental systems that turn fragile protocols
                  into scalable platforms.
                </p>
              </div>
              <div className="robot-console">
                <div
                  className="batch-cadence"
                  aria-label="Weekly batch schedule: Monday, Wednesday, and Friday"
                >
                  <div className="batch-cadence-head">
                    <span>Weekly batch cadence</span>
                    <strong>Mon / Wed / Fri</strong>
                  </div>
                  <div className="schedule-track" aria-hidden="true">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                      (day, index) => (
                        <span
                          key={day}
                          className={[0, 2, 4].includes(index) ? "active" : ""}
                        >
                          {day}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <div className={`robot-stage phase-${robotPhase}`} aria-hidden="true">
                  <div className="robot-grid" />
                  <div className="automation-meta">
                    <span>384-well plate</span>
                    <strong>{robotPhases[robotPhase].label}</strong>
                  </div>
                  <div className="robot-rail" />
                  <div className="scanner-beam" />
                  <div className="sample-carrier">
                    {Array.from({ length: 12 }, (_, index) => (
                      <i key={index} />
                    ))}
                  </div>
                  <div className="robot-stations">
                    {robotPhases.map((phase, index) => (
                      <span key={phase.code} className={robotPhase === index ? "active" : ""}>
                        <i>{phase.code}</i>
                        {phase.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="robot-feed" aria-live="polite">
                  <span className="live-indicator" />
                  <span key={robotPhase}>{robotPhases[robotPhase].detail}</span>
                  <strong>{robotPhases[robotPhase].code}</strong>
                </div>
              </div>
              <p className="data-readout">Automated batching / 3 runs weekly</p>
            </article>
          </div>
        </section>

        <section id="vision" className="vision-section">
          <div className="vision-grid" />
          <div className="vision-content">
            <div className="vision-layout">
              <p className="vision-large" aria-label={manifesto}>
                {manifestoWords.map((word, index) => {
                  const normalized = word.replace(/[^a-z]/gi, "").toLowerCase();
                  const highlighted = normalized === "signal" || normalized === "complex";

                  return (
                    <span className="vision-word-mask" aria-hidden="true" key={`${word}-${index}`}>
                      <span
                        className={`vision-word ${highlighted ? "highlight" : ""}`}
                        data-vision-word
                      >
                        {word}
                      </span>
                    </span>
                  );
                })}
              </p>
            </div>
            <div className="vision-status" data-reveal="line">
              <span>Signal integrity</span>
              <span className="status-line"><i /></span>
              <span>Scale ready</span>
            </div>
          </div>
        </section>

        <section id="people" className="people-section section-pad">
          <div className="page-width">
            <div className="split-heading" data-reveal="heading">
              <div>
                <p className="eyebrow">People</p>
                <h2>The lab behind the platform.</h2>
              </div>
              <p>
                A live roster of scientists, engineers, and computational
                builders shaping the lab's next wave of genomic, multiomic, and
                automated technologies.
              </p>
            </div>

            <div className="people-layout">
              <article className="person-feature" key={person.name}>
                <div className="portrait-frame">
                  {person.photo ? (
                    <img src={person.photo} alt={person.name} />
                  ) : (
                    <div className="portrait-placeholder">{person.initials}</div>
                  )}
                  <div className="portrait-status">
                    <span>Live profile</span>
                    <span><i /> Active</span>
                  </div>
                </div>
                <div className="person-copy">
                  <div>
                    <div className="person-index">
                      <span>{String(activePerson + 1).padStart(2, "0")}</span>
                      <i />
                      <span>{person.role}</span>
                    </div>
                    <h3>{person.name}</h3>
                    <p className="person-summary">{person.summary}</p>
                  </div>
                  <div>
                    <dl className="person-details">
                      <div><dt>Specialty</dt><dd>{person.specialty}</dd></div>
                      <div><dt>Current focus</dt><dd>{person.focus}</dd></div>
                      <div><dt>Operating mode</dt><dd>{person.mode}</dd></div>
                    </dl>
                    <div className="signal-tags">
                      {person.signals.map((signal) => <span key={signal}>{signal}</span>)}
                    </div>
                  </div>
                </div>
              </article>

              <div className="people-list" role="tablist" aria-label="Lab members" data-reveal="right">
                {people.map((member, index) => (
                  <button
                    key={member.name}
                    type="button"
                    role="tab"
                    aria-selected={activePerson === index}
                    className={activePerson === index ? "active" : ""}
                    onMouseEnter={() => setActivePerson(index)}
                    onFocus={() => setActivePerson(index)}
                    onClick={() => setActivePerson(index)}
                  >
                    <span>
                      <small className="member-index">
                        {String(index + 1).padStart(2, "0")} / Profile
                      </small>
                      <strong>{member.name}</strong>
                      <small>{member.role}</small>
                    </span>
                    <Arrow />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="papers" className="papers-section section-pad">
          <div className="page-width">
            <div className="section-heading papers-heading" data-reveal="heading">
              <div>
                <p className="eyebrow">Selected Publications</p>
                <h2>Recent work published from the lab.</h2>
              </div>
              <div className="papers-register" aria-label="Publication archive summary">
                <span>Research archive</span>
                <strong>03 records</strong>
                <small>2023—2026</small>
              </div>
            </div>
            <div className="paper-list">
              {papers.map((paper) => (
                <article className="paper-row" key={paper.number} data-reveal="paper">
                  <div className="paper-register">
                    <span className="paper-number">{paper.number}</span>
                    <small>{paper.year}</small>
                  </div>
                  <div className="paper-copy">
                    <div className="paper-meta">
                      <span>{paper.category}</span>
                      <span>{paper.journal}</span>
                    </div>
                    <h3>{paper.title}</h3>
                    <p>{paper.copy}</p>
                    <a href={paper.href} target="_blank" rel="noreferrer">
                      {paper.label} <Arrow />
                    </a>
                  </div>
                  <PublicationCover
                    kind={paper.cover}
                    code={paper.coverCode}
                    title={paper.coverTitle}
                    issue={paper.issue}
                    doi={paper.doi}
                    image={paper.coverImage}
                    alt={paper.coverAlt}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="join" className="join-section">
          <div className="join-noise" />
          <div className="page-width join-content">
            <div className="join-intro" data-reveal="left">
              <p className="eyebrow light">Join the Lab</p>
              <h2>
                Build the next generation
                <span>of biological measurement.</span>
              </h2>
              <p>
                We are recruiting PhD students and postdoctoral researchers who
                want to invent assays, integrate automation, and turn complex
                genomics into tools that shift what can be measured.
              </p>
              <button className="button button-accent" type="button" onClick={() => setContactOpen(true)}>
                Contact the Lab <Arrow />
              </button>
            </div>
            <div className="track-list" data-reveal="right">
              {tracks.map((track, index) => (
                <article key={track.label}>
                  <div className="track-meta">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{track.status}</span>
                    <span>{track.count}</span>
                  </div>
                  <h3>{track.label}</h3>
                  <p>{track.title}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="site-footer">
        <div className="page-width footer-grid">
          <div>
            <p className="footer-brand">Technology Innovation Lab <span>@ SCB</span></p>
            <p className="footer-purpose">
              A precision system for single-cell multiomics, inventive genomics,
              and robotic workflows.
            </p>
          </div>
          <div>
            <p className="footer-label">Navigation</p>
            <a href="#artifacts">Core Platforms</a>
            <a href="#people">People Roster</a>
            <a href="#papers">Publication Stack</a>
          </div>
          <div>
            <p className="footer-label">Contact</p>
            <a href="mailto:ivr4003@med.cornell.edu">ivr4003@med.cornell.edu</a>
            <p>New York, NY</p>
          </div>
        </div>
        <div className="page-width footer-bottom">
          <span><i /> System operational</span>
          <span>SCB / Weill Cornell Medicine / 2026</span>
        </div>
      </footer>

      {contactOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setContactOpen(false)}>
          <section
            className="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={() => setContactOpen(false)} aria-label="Close contact panel">
              <span />
              <span />
            </button>
            <p className="eyebrow">Contact Channel</p>
            <h2 id="contact-title">Direct line open.</h2>
            <p>For PhD, postdoctoral, and visiting applications, this is the fastest way into the lab.</p>
            <button className="copy-email" type="button" onClick={copyEmail}>
              <span>ivr4003@med.cornell.edu</span>
              <strong>{copied ? "Copied" : "Copy email"}</strong>
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
