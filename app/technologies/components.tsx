import { assetPath } from "../asset-path";
import { getPublishedTechnologies, technologyContactHref, type Technology } from "./content";

function Arrow() { return <span className="arrow-icon" aria-hidden="true" />; }

function TechnologyArt({ technology }: { technology: Technology }) {
  return <div className="technology-art editorial-image-circle">
    {/* Static vector: no image optimizer is needed for this 3 KB SVG. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={assetPath(technology.image.src)} alt={technology.image.alt} width={600} height={600} />
  </div>;
}

export function TechnologyHub() {
  const technologies = getPublishedTechnologies();
  return <>
    <section className="page-width technology-intro" aria-labelledby="technologies-title">
      <p className="editorial-kicker">From our bench to yours</p>
      <h1 id="technologies-title" className="technology-heading">Try our<br /><em>technologies.</em></h1>
      <p className="editorial-description">New tools open new questions. Explore the methods we develop, discover what they can measure, and talk with us about trying them in your lab.</p>
    </section>
    <section className="page-width technology-catalogue" aria-labelledby="catalogue-title">
      <div className="technology-section-label"><h2 id="catalogue-title">Explore the technologies</h2><span>{String(technologies.length).padStart(2, "0")} {technologies.length === 1 ? "technology" : "technologies"}</span></div>
      <div className="technology-grid">
        {technologies.map((technology, index) => <article className="technology-card" key={technology.slug}>
          <div className="technology-card-copy">
            <p className="technology-category"><span>{String(index + 1).padStart(2, "0")}</span>{technology.category}</p>
            <h3><a href={assetPath(`/technologies/${technology.slug}/`)}>{technology.name}</a></h3>
            <p className="technology-card-summary">{technology.summary}</p>
            <p className="technology-status">{technology.access.status}</p>
            <a className="button button-dark" href={assetPath(`/technologies/${technology.slug}/`)}>Explore {technology.name} <Arrow /></a>
          </div>
          <TechnologyArt technology={technology} />
        </article>)}
      </div>
      <p className="technology-catalogue-note">Each technology brings together its scientific background, resources, and a direct way to get in touch.</p>
    </section>
  </>;
}

export function TechnologyDetail({ technology }: { technology: Technology }) {
  return <article className="technology-detail page-width">
    <a className="editorial-back-link technology-back" href={assetPath("/technologies/")}><span aria-hidden="true">←</span> All technologies</a>
    <header className="technology-detail-header">
      <div>
        <p className="editorial-kicker">{technology.category}</p>
        <h1 className="technology-heading">{technology.name}</h1>
        <p className="technology-detail-summary">{technology.summary}</p>
        <div className="technology-quick-links"><a className="button button-dark" href="#interest">Enquire about a starter kit <Arrow /></a><a className="text-link" href="#resources">View resources <span aria-hidden="true">↓</span></a></div>
      </div>
      <TechnologyArt technology={technology} />
    </header>
    <div className="technology-detail-grid">
      <div className="technology-science">
        <section aria-labelledby="overview-title">
          <p className="eyebrow">The science</p>
          <h2 id="overview-title">A closer look.</h2>
          {technology.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <h3>What could you explore?</h3>
          <ul className="technology-applications">{technology.applications.map((application) => <li key={application}>{application}</li>)}</ul>
          <a className="technology-publication" href={technology.publication.href} target="_blank" rel="noopener noreferrer">
            <span className="eyebrow">Read the paper · {technology.publication.label}</span>
            <span>{technology.publication.title} <span aria-hidden="true">↗</span></span>
          </a>
        </section>
        <section id="resources" className="technology-resources" aria-labelledby="resources-title">
          <p className="eyebrow">Documentation</p>
          <h2 id="resources-title">Resources for your bench.</h2>
          <p>Application notes and detailed protocols will be available here.</p>
          <ul className="technology-resource-list">
            {technology.resources.map((resource) => <li key={resource.title} className="technology-resource">
              <div><h3>{resource.title}</h3><p>{resource.description}</p></div>
              {resource.status === "available"
                ? <a className="text-link" href={resource.href.startsWith("/") ? assetPath(resource.href) : resource.href}>{resource.label} <span aria-hidden="true">↓</span></a>
                : <span className="technology-resource-status">Coming soon</span>}
            </li>)}
          </ul>
        </section>
      </div>
      <aside id="interest" className="technology-interest" aria-labelledby="interest-title">
        <p className="eyebrow">From our bench to yours</p>
        <h2 id="interest-title">{technology.access.title}</h2>
        <p>{technology.access.description}</p>
        <a className="button button-light" href={technologyContactHref(technology)}>Express interest <Arrow /></a>
        <p className="technology-email-note">Opens your email app with a short project outline to fill in.</p>
        <a className="technology-email" href={`mailto:${technology.access.email}`}>{technology.access.email}</a>
        <p className="technology-access-note">{technology.access.note}</p>
      </aside>
    </div>
  </article>;
}
