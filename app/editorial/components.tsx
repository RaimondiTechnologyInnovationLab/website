import "server-only";

import { assetPath } from "../asset-path";
import {
  editorialCollections,
  editorialPath,
  formatEditorialDate,
  getPublishedEntries,
  type EditorialBlock,
  type EditorialEntry,
  type EditorialKind,
} from "./content";

function Arrow() {
  return <span aria-hidden="true" className="arrow-icon" />;
}

function EditorialImage({ image, loading = "lazy" }: {
  image: NonNullable<EditorialEntry["image"]>;
  loading?: "eager" | "lazy";
}) {
  return (
    <div className="editorial-image-circle">
      {/* A plain image preserves the original full-width composition in static exports. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={assetPath(image.src)} alt={image.alt} width={image.width} height={image.height}
        loading={loading} decoding="async" />
    </div>
  );
}

export function EditorialEmptyState({ kind }: { kind: EditorialKind }) {
  const collection = editorialCollections[kind];
  return (
    <div className={`editorial-empty editorial-empty-${kind}`}>
      <p className="editorial-empty-label">{kind === "news" ? "No news yet" : "No posts yet"}</p>
      <h3 className="editorial-empty-title">{collection.emptyTitle}</h3>
      <p className="editorial-empty-copy">{collection.emptyCopy}</p>
    </div>
  );
}

export function EditorialCard({ kind, entry }: { kind: EditorialKind; entry: EditorialEntry }) {
  return (
    <article className={`editorial-card${entry.image ? " editorial-card-with-image" : ""}`}>
      <div className="editorial-card-copy">
        <p className="editorial-card-meta">
          <time dateTime={entry.date}>{formatEditorialDate(entry.date)}</time>
          {entry.author && <span>{entry.author}</span>}
        </p>
        <h3 className="editorial-card-title">
          <a href={editorialPath(kind, entry.slug)}>{entry.title}</a>
        </h3>
        <p className="editorial-card-summary">{entry.summary}</p>
        <a className="editorial-card-link" href={editorialPath(kind, entry.slug)} aria-label={`Read ${entry.title}`}>
          Read {kind === "news" ? "update" : "post"} <Arrow />
        </a>
      </div>
      {entry.image && <EditorialImage image={entry.image} />}
    </article>
  );
}

/** Pass this server-rendered element to the homepage, never the underlying entries. */
export function EditorialPreview({ kind }: { kind: EditorialKind }) {
  const entries = getPublishedEntries(kind).slice(0, 3);
  return (
    <div className="editorial-preview">
      {entries.length > 0 ? (
        <div className="editorial-card-list">
          {entries.map((entry) => <EditorialCard key={entry.slug} kind={kind} entry={entry} />)}
        </div>
      ) : <EditorialEmptyState kind={kind} />}
    </div>
  );
}

export function EditorialArchive({ kind }: { kind: EditorialKind }) {
  const collection = editorialCollections[kind];
  const entries = getPublishedEntries(kind);
  return (
    <>
      <header className="editorial-intro page-width">
        <p className="editorial-kicker eyebrow">{collection.kicker}</p>
        <h1 className="editorial-heading"><em>{collection.title}.</em></h1>
        <p className="editorial-description">{collection.description}</p>
      </header>
      <section className="editorial-content page-width" aria-label={`All ${collection.title.toLowerCase()}`}>
        <div className="editorial-archive-nav">
          <h2 className="editorial-count">{kind === "news" ? "Latest updates" : "Latest posts"}</h2>
          <a href={editorialPath(kind === "news" ? "blog" : "news")}>
            {kind === "news" ? "Explore the blog" : "See the news"} <Arrow />
          </a>
        </div>
        {entries.length > 0 ? (
          <div className="editorial-card-list">
            {entries.map((entry) => <EditorialCard key={entry.slug} kind={kind} entry={entry} />)}
          </div>
        ) : <EditorialEmptyState kind={kind} />}
      </section>
    </>
  );
}

function BodyBlock({ block }: { block: EditorialBlock }) {
  switch (block.type) {
    case "paragraph": return <p>{block.text}</p>;
    case "heading": return <h2>{block.text}</h2>;
    case "quote": return <blockquote><p>{block.text}</p>{block.attribution && <cite>{block.attribution}</cite>}</blockquote>;
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return <List>{block.items.map((item, index) => <li key={index}>{item}</li>)}</List>;
    }
    case "link": return <p><a href={block.href.startsWith("/") ? assetPath(block.href) : block.href}>{block.text}</a></p>;
  }
}

export function EditorialArticle({ kind, entry }: { kind: EditorialKind; entry: EditorialEntry }) {
  return (
    <article className="editorial-article page-width">
      <header className="editorial-article-header">
        <a className="editorial-back-link" href={editorialPath(kind)}>Back to {editorialCollections[kind].title}</a>
        <p className="editorial-kicker eyebrow">{editorialCollections[kind].entryLabel}</p>
        <h1 className="editorial-article-title">{entry.title}</h1>
        <p className="editorial-article-summary">{entry.summary}</p>
        <p className="editorial-article-meta">
          <time dateTime={entry.date}>{formatEditorialDate(entry.date)}</time>
          {entry.author && <span>By {entry.author}</span>}
        </p>
      </header>
      {entry.image && <figure className={`editorial-article-photo${kind === "blog" ? " editorial-article-illustration" : ""}`}><EditorialImage image={entry.image} loading="eager" /></figure>}
      <div className="editorial-body">
        {entry.body.map((block, index) => <BodyBlock key={index} block={block} />)}
      </div>
      <footer className="editorial-article-footer">
        <a className="editorial-archive-link" href={editorialPath(kind)}>
          {editorialCollections[kind].archiveLink} <Arrow />
        </a>
      </footer>
    </article>
  );
}
