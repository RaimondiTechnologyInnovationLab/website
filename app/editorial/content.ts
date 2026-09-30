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
  /** Approved local photo. Rendering masks the full-width composition in a circle. */
  readonly image?: {
    readonly src: string;
    readonly alt: string;
    readonly width: number;
    readonly height: number;
  };
  readonly body: readonly EditorialBlock[];
}

/**
 * Add only approved content here. There are no invented posts or announcements.
 * Copy the DRAFT template from docs/content-authoring.md; it is intentionally
 * outside these entry arrays. Drafts are filtered before routes or UI receive data.
 * A public repository is not a private place to store unpublished material.
 */
const newsEntries: readonly EditorialEntry[] = [
  {
    slug: "roswell-park-genomics-epigenomics-symposium-2026",
    title: "Ivan Raimondi speaks at Roswell Park",
    date: "2026-09-30",
    summary: "6th Translational Genomics & Epigenomics Symposium · Buffalo, NY",
    status: "published",
    image: {
      src: "/news-images/roswell-park-symposium-2026.webp",
      alt: "Ivan Raimondi speaking at the Roswell Park lectern beside a projected scientific slide.",
      width: 1536,
      height: 2048,
    },
    body: [
      { type: "paragraph", text: "Ivan Raimondi was an invited speaker at the 6th Translational Genomics & Epigenomics Symposium, held at Roswell Park Comprehensive Cancer Center in Buffalo on September 24–25, 2026." },
      { type: "paragraph", text: "The symposium brought together researchers working on genomic and epigenomic technologies and their applications to cancer and other chronic diseases." },
      { type: "link", text: "About the symposium", href: "https://www.roswellparkomicssymposium.org/" },
    ],
  },
];
const blogEntries: readonly EditorialEntry[] = [
  {
    "slug": "before-we-trust-spatial-ai",
    "title": "Before we trust spatial AI, we need to trust the cell",
    "date": "2026-09-30",
    "summary": "A critical reading of ResolVI and recent spatial transcriptomics studies: how misplaced RNA can become a biological story, what probabilistic AI can correct, and how to validate the result.",
    "status": "published",
    "body": [
      {
        "type": "paragraph",
        "text": "Consider a T cell sitting against a tumor cell. Its spatial transcriptomic profile contains a small epithelial program. That observation could motivate an interesting biological hypothesis. It could also mean that some tumor transcripts were assigned to the T cell. The two explanations can produce the same attractive figure: a cell state that changes with distance from the tumor."
      },
      {
        "type": "paragraph",
        "text": "For spatial AI, this is a foundational problem. A model trained to predict expression from a cell’s neighborhood may learn the measurement process as well as the biology. ResolVI, published in Nature Methods on 24 September 2026, makes this a timely moment to examine where correction belongs in an analysis, what evidence supports it, and what still requires an experiment."
      },
      {
        "type": "link",
        "text": "This week’s paper: Ergen and Yosef, ResolVI (Nature Methods, 24 September 2026)",
        "href": "https://www.nature.com/articles/s41592-026-03212-9"
      },
      {
        "type": "heading",
        "text": "Why the error can look like a discovery"
      },
      {
        "type": "paragraph",
        "text": "In imaging-based spatial transcriptomics, locating an RNA molecule and deciding which cell owns it are separate steps. A molecular coordinate can be precise while its cell assignment is wrong. At crowded interfaces, an imperfect boundary can mix transcripts from adjacent cells. The resulting error is structured: the contaminating signature comes from the very neighborhood whose influence the experiment aims to measure."
      },
      {
        "type": "paragraph",
        "text": "Mitchel and colleagues tested this problem across tissues and platforms. Their January 2026 Nature Genetics study found that segmentation-related admixture can distort differential expression, neighborhood effects and ligand–receptor inference. They also showed that factorizing local molecular neighborhoods can help identify and remove contaminating components. The important warning is that a spatial association can be generated during quantification, before any downstream biological model is fitted."
      },
      {
        "type": "link",
        "text": "Evidence: Mitchel et al., Impact and correction of segmentation errors in spatial transcriptomics (20 January 2026)",
        "href": "https://www.nature.com/articles/s41588-025-02497-4"
      },
      {
        "type": "paragraph",
        "text": "Here is the implication for AI evaluation: accurate prediction of the observed matrix is an incomplete success criterion. If the matrix contains reproducible neighborhood-dependent contamination, predicting that contamination can improve a score. Holding out cells from the same tissue does not, by itself, distinguish a learned biological response from a learned measurement artifact. This is an inference from the measurement problem, rather than a reported benchmark result for every spatial model."
      },
      {
        "type": "heading",
        "text": "How ResolVI represents the problem"
      },
      {
        "type": "paragraph",
        "text": "ResolVI starts after segmentation, with cell-level counts, spatial positions and sample information. Its generative model explains observed RNA through three contributions: expression attributed to the cell, expression misassigned from nearby cells, and nonspecific background. A neural encoder compresses expression into a latent cell state; a decoder generates expression profiles from that state. Variational inference estimates model parameters and an approximate posterior over hidden quantities."
      },
      {
        "type": "paragraph",
        "text": "The latent prior is a mixture of Gaussians, allowing multiple modes rather than one undifferentiated cloud. Neighbor contributions are weighted, and the model can incorporate cell-type labels in a semisupervised setting. Its output includes corrected expression estimates and a representation for downstream analysis. These are conditional estimates under a model; the original molecules have not been experimentally remeasured."
      },
      {
        "type": "link",
        "text": "Technical reference: ResolVI model and inference in scvi-tools 1.5.1",
        "href": "https://docs.scvi-tools.org/en/1.5.1/user_guide/models/resolvi.html"
      },
      {
        "type": "paragraph",
        "text": "The useful AI idea here is explicit modeling of how measurements become contaminated. It gives the analysis quantities to inspect beyond an embedding: how much of each cell’s signal is attributed to local admixture, how much to background, and where those estimates concentrate in the tissue. A visually cleaner map is only one possible consequence."
      },
      {
        "type": "heading",
        "text": "What the new paper actually establishes"
      },
      {
        "type": "paragraph",
        "text": "Ergen and Yosef evaluate ResolVI across imaging- and sequencing-based datasets. One mouse-brain Xenium example contains approximately 130,000 cells and a 248-gene panel; a human-liver CosMx analysis contains 1.2 million cells and 1,000 genes. They report reduced implausible marker co-expression, improved cell-type resolution and integration, and downstream analyses of tumor and inflammatory niches."
      },
      {
        "type": "paragraph",
        "text": "These results support the value of modeling contamination at useful scale. They do not supply molecule-by-molecule ground truth. The authors explicitly discuss context dependence in marker-based benchmarks, dependence on initial segmentation quality, and sensitivity to the latent representation. The strongest reading is therefore evidence of improved analysis in the tested settings, with assumptions that remain relevant in a new tissue."
      },
      {
        "type": "link",
        "text": "Read the results and limitations in the ResolVI paper",
        "href": "https://www.nature.com/articles/s41592-026-03212-9"
      },
      {
        "type": "heading",
        "text": "Three approaches to the same problem"
      },
      {
        "type": "paragraph",
        "text": "Correction is not a single interchangeable operation. Proseg acts on segmentation itself. In the 2025 study by Jones and colleagues, a probabilistic approach inspired by cell simulation adjusts plausible cell shapes to explain transcript locations. It works upstream of the final cell-by-gene matrix, changing the assignment on which later analysis depends."
      },
      {
        "type": "link",
        "text": "Upstream approach: Jones et al., Cell simulation as cell segmentation (22 May 2025)",
        "href": "https://www.nature.com/articles/s41592-025-02697-0"
      },
      {
        "type": "paragraph",
        "text": "A second approach is to decompose already mixed cell profiles. Bilous and colleagues studied more than 40 breast and lung tumor sections and introduced SPLIT in April 2026. It uses reference-informed cell-type mixtures to separate signals. Their multiplexed protein staining provides an independent check on cell identity, and their analysis includes cases in which tumor-associated contamination confuses transcript-based annotation."
      },
      {
        "type": "paragraph",
        "text": "A particularly instructive example concerns cycling tumor cells missing from a reference. Such cells can look like tumor profiles mixed with cycling lymphocytes. SPLIT offers an optional, spatially selective decomposition mode that uses neighborhood evidence to help avoid correcting away that phenotype. The broader lesson is that a reference can make correction more informative while also creating a vulnerability when the relevant state is absent. Their benchmark also found cases in which ResolVI suppressed T-cell programs along with contamination. This earlier comparison used the implementation available to that study; it is evidence of a context-dependent failure mode, rather than a universal ranking of the September publication."
      },
      {
        "type": "link",
        "text": "Reference-informed approach: Bilous et al., Resolving sensitivity, specificity and signal contamination in Xenium spatial transcriptomics (30 April 2026)",
        "href": "https://www.nature.com/articles/s41592-026-03089-8"
      },
      {
        "type": "paragraph",
        "text": "ResolVI adds a third route: jointly estimating latent cell states and nuisance contributions. These approaches differ in inputs and assumptions, with partly overlapping correction mechanisms. Some combinations can be useful, but require validation. For a particular experiment, their disagreement is useful diagnostic information. Automatically applying every correction in sequence would make it harder to identify which assumption changed the biological conclusion."
      },
      {
        "type": "heading",
        "text": "A practical test before believing a neighborhood effect"
      },
      {
        "type": "paragraph",
        "text": "The following is a proposed validation workflow, not an experiment reported in the papers above. Suppose the biological claim is that proximity to tumor cells changes a T-cell program. Define the program and the proximity comparison before optimizing correction. Then ask whether the same conclusion survives reasonable alternatives in measurement and analysis."
      },
      {
        "type": "list",
        "items": [
          "Preserve the evidence. Keep molecule coordinates, images, segmentation masks and the original count matrix. Store inferred expression separately, with software versions and parameters.",
          "Inspect the disputed interface. Examine individual molecules and boundaries where the effect is strongest. Ask whether the relevant transcripts lie throughout the cell or cluster along a neighboring compartment.",
          "Compare analysis branches. Run the original assignment, an alternative segmentation and a justified correction method. Track effect direction and magnitude, cell counts, and which cells change identity.",
          "Challenge rare states. Deliberately inspect low-frequency and transitional populations. Require supporting markers or another measurement before deciding that an unusual combination is contamination.",
          "Test across biological replicates. Use donor- or specimen-level comparisons for claims intended to generalize across people or samples. Large cell numbers do not replace independent specimens.",
          "Use an independent readout. Protein staining, another imaging assay or a targeted perturbation can test the specific claim. A ligand and receptor in adjacent profiles are insufficient evidence of an active causal signal."
        ]
      },
      {
        "type": "paragraph",
        "text": "A convincing outcome would be a spatial effect that remains interpretable across analysis branches and is supported by an independent measurement. If the result appears only after one aggressive correction, the immediate output should be a hypothesis with a clear dependency on that method. If it disappears, inspect the affected molecules before concluding that the original biology was false."
      },
      {
        "type": "heading",
        "text": "What this changes for automation"
      },
      {
        "type": "paragraph",
        "text": "Automated spatial workflows need quality gates that reflect this ambiguity. Plummer and colleagues’ cross-site study of imaging-based assays is useful here: it shows why metrics must be interpreted in the context of tissue, platform and panel. Transcript yield, specificity and assignment quality answer different questions. A single summary score cannot safely stand in for all three."
      },
      {
        "type": "link",
        "text": "Benchmarking context: Plummer et al., Standardized metrics for assessment and reproducibility of imaging-based spatial transcriptomics datasets (online 3 December 2025)",
        "href": "https://www.nature.com/articles/s41587-025-02811-9"
      },
      {
        "type": "paragraph",
        "text": "An actionable automation design would generate a paired report for every sample: original and inferred expression, a tissue map of estimated contamination, cells whose annotation changed, and biological effects that changed sign or disappeared. Thresholds should be calibrated for the assay and question, with flagged cases routed to review. This is an engineering recommendation, not a validated universal standard."
      },
      {
        "type": "paragraph",
        "text": "The same discipline should carry into model training. Record which segmentation and correction produced each training matrix. Evaluate on held-out specimens. Include uncorrected and alternative-processing baselines. Ask whether performance gains persist on independent measurements or experimentally defined outcomes. Otherwise, a model and its preprocessing pipeline may be validating one another."
      },
      {
        "type": "heading",
        "text": "The takeaway"
      },
      {
        "type": "paragraph",
        "text": "Spatial AI becomes more scientifically useful when it makes the measurement process visible. ResolVI provides one concrete way to do that; the segmentation and benchmarking studies explain why it matters. For technology development, the next question is practical: which biological conclusions remain stable when plausible explanations for measurement error are allowed to compete? That is a more informative target than a cleaner embedding alone."
      },
      {
        "type": "paragraph",
        "text": "Reading route: start with ResolVI Figure 1 for the model, then its Discussion for the assumptions. Read the segmentation-error study for failure modes, the SPLIT study for independent identity checks, and the cross-site metrics study for quality-control design. All research articles linked here are peer-reviewed publications; the software documentation is a separate technical resource. Literature checked on 30 September 2026."
      }
    ]
  }
];

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
    if (entry.image !== undefined) {
      const image = entry.image;
      if (!image || typeof image !== "object" || typeof image.src !== "string" || /\s/.test(image.src) ||
        !/^\/news-images\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:png|jpe?g|webp)$/.test(image.src)) {
        throw new Error(`Editorial content: ${entry.slug}.image.src must be a local raster photo in /news-images/.`);
      }
      requireText(image.alt, `${entry.slug}.image.alt`);
      for (const field of ["width", "height"] as const) {
        if (!Number.isInteger(image[field]) || image[field] < 1 || image[field] > 10000) {
          throw new Error(`Editorial content: ${entry.slug}.image.${field} must be a positive integer up to 10000.`);
        }
      }
    }
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
