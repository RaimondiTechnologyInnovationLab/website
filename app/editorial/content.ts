import "server-only";

import type { Metadata } from "next";
import { assetPath } from "../asset-path";

export type EditorialKind = "news" | "blog";

/** Plain-text blocks are rendered by React. Raw HTML and executable markup are not supported. */
export type EditorialBlock =
  | { readonly type: "paragraph"; readonly text: string }
  | { readonly type: "heading"; readonly text: string }
  | { readonly type: "list"; readonly items: readonly string[]; readonly ordered?: boolean }
  | { readonly type: "quote"; readonly text: string; readonly attribution?: string }
  | { readonly type: "link"; readonly text: string; readonly href: string };

export interface EditorialEntry {
  /** Stable, lowercase URL identifier. Changing it breaks previously shared links. */
  readonly slug: string;
  readonly title: string;
  /** Publication date in YYYY-MM-DD format. It is displayed in UTC. */
  readonly date: string;
  readonly summary: string;
  readonly status: "draft" | "published";
  readonly author?: string;
  readonly body: readonly EditorialBlock[];
}

/**
 * Add only approved content here. There are no invented posts or announcements.
 * Copy the DRAFT template from docs/content-authoring.md; it is intentionally
 * outside these entry arrays. Drafts are filtered before routes or UI receive data.
 * A public repository is not a private place to store unpublished material.
 */
const newsEntries: readonly EditorialEntry[] = [];
const blogEntries: readonly EditorialEntry[] = [];

export const editorialCollections = {
  news: {
    title: "News",
    kicker: "From the lab",
    description: "Research updates, publications, and milestones as the lab takes shape.",
    emptyTitle: "The next chapter is taking shape.",
    emptyCopy: "There are no news updates yet. Research updates and milestones will appear here when there is something to share.",
    archiveLink: "View all news",
    entryLabel: "news update",
  },
  blog: {
    title: "Blog",
    kicker: "Ideas in progress",
    description: "Notes on biological questions, technology, and the process of building new tools.",
    emptyTitle: "Room for ideas to grow.",
    emptyCopy: "There are no blog posts yet. Notes on science, methods, and building new tools will appear here.",
    archiveLink: "View the blog",
    entryLabel: "blog post",
  },
} as const;

function requireText(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Editorial content: ${field} must be nonempty text.`);
  }
}

/** Links may point to HTTPS sources or a site path without the deployment prefix. */
export function isSafeEditorialLink(href: string): boolean {
  if (typeof href !== "string" || /[\\\s]/u.test(href) ||
    Array.from(href).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function validateBlock(block: EditorialBlock, entry: string, index: number): void {
  const field = `${entry}.body[${index}]`;
  if (!block || typeof block !== "object") throw new Error(`Editorial content: invalid ${field}.`);
  switch (block.type) {
    case "paragraph":
    case "heading":
      requireText(block.text, `${field}.text`);
      return;
    case "quote":
      requireText(block.text, `${field}.text`);
      if (block.attribution !== undefined) requireText(block.attribution, `${field}.attribution`);
      return;
    case "list":
      if (!Array.isArray(block.items) || block.items.length === 0) {
        throw new Error(`Editorial content: ${field}.items must contain at least one item.`);
      }
      block.items.forEach((item, itemIndex) => requireText(item, `${field}.items[${itemIndex}]`));
      if (block.ordered !== undefined && typeof block.ordered !== "boolean") {
        throw new Error(`Editorial content: ${field}.ordered must be a boolean.`);
      }
      return;
    case "link":
      requireText(block.text, `${field}.text`);
      if (!isSafeEditorialLink(block.href)) {
        throw new Error(`Editorial content: ${field}.href must be an HTTPS URL or a site-relative path.`);
      }
      return;
    default:
      throw new Error(`Editorial content: unsupported block type in ${field}.`);
  }
}

/** Validate all entries, including drafts, so authoring mistakes fail the build. */
export function validateEditorialEntries(entries: readonly EditorialEntry[]): void {
  const slugs = new Set<string>();
  for (const entry of entries) {
    requireText(entry.slug, "slug");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)) {
      throw new Error(`Editorial content: invalid slug "${entry.slug}". Use lowercase words separated by hyphens.`);
    }
    if (slugs.has(entry.slug)) throw new Error(`Editorial content: duplicate slug "${entry.slug}".`);
    slugs.add(entry.slug);
    requireText(entry.title, `${entry.slug}.title`);
    requireText(entry.summary, `${entry.slug}.summary`);
    if (entry.author !== undefined) requireText(entry.author, `${entry.slug}.author`);
    const timestamp = Date.parse(`${entry.date}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !Number.isFinite(timestamp) ||
      new Date(timestamp).toISOString().slice(0, 10) !== entry.date) {
      throw new Error(`Editorial content: ${entry.slug}.date must be a real date in YYYY-MM-DD format.`);
    }
    if (entry.status !== "draft" && entry.status !== "published") {
      throw new Error(`Editorial content: ${entry.slug}.status must be "draft" or "published".`);
    }
    if (!Array.isArray(entry.body) || entry.body.length === 0) {
      throw new Error(`Editorial content: ${entry.slug}.body must contain at least one block.`);
    }
    entry.body.forEach((block, index) => validateBlock(block, entry.slug, index));
  }
}

/** A new array, newest first; never mutates the authoring source. */
export function selectPublishedEntries(entries: readonly EditorialEntry[]): readonly EditorialEntry[] {
  validateEditorialEntries(entries);
  return entries.filter((entry) => entry.status === "published").sort((a, b) => {
    if (a.date !== b.date) return a.date > b.date ? -1 : 1;
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });
}

const publishedEntries: Record<EditorialKind, readonly EditorialEntry[]> = {
  news: selectPublishedEntries(newsEntries),
  blog: selectPublishedEntries(blogEntries),
};

export function getPublishedEntries(kind: EditorialKind): readonly EditorialEntry[] {
  return publishedEntries[kind];
}

export function getPublishedEntry(kind: EditorialKind, slug: string): EditorialEntry | undefined {
  return getPublishedEntries(kind).find((entry) => entry.slug === slug);
}

export function editorialPath(kind: EditorialKind, slug?: string): string {
  return assetPath(`/${kind}/${slug ? `${encodeURIComponent(slug)}/` : ""}`);
}

export function formatEditorialDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00.000Z`));
}

/** Canonicals always identify the official public site, including in local previews. */
export function getEditorialMetadata(kind: EditorialKind, entry?: EditorialEntry): Metadata {
  const collection = editorialCollections[kind];
  const title = `${entry?.title ?? collection.title} | Technology Innovation Lab`;
  const description = entry?.summary ?? collection.description;
  const canonical = `https://raimonditechnologyinnovationlab.github.io/website/${kind}/${entry ? `${encodeURIComponent(entry.slug)}/` : ""}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: entry ? "article" : "website",
      ...(entry ? { publishedTime: `${entry.date}T00:00:00.000Z`, ...(entry.author ? { authors: [entry.author] } : {}) } : {}),
      images: [{
        url: "https://raimonditechnologyinnovationlab.github.io/website/og-til-cells-2026-09-30-v2.png",
        width: 1200,
        height: 630,
        alt: "Technology Innovation Lab",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://raimonditechnologyinnovationlab.github.io/website/og-til-cells-2026-09-30-v2.png"],
    },
  };
}
