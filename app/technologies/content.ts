import "server-only";

import type { Metadata } from "next";

export type TechnologyResource = {
  readonly title: string;
  readonly description: string;
} & (
  | { readonly status: "coming-soon" }
  | { readonly status: "available"; readonly href: string; readonly label: string }
);

export interface Technology {
  readonly slug: string;
  readonly name: string;
  readonly category: string;
  readonly status: "published" | "draft";
  readonly summary: string;
  readonly image: { readonly src: string; readonly alt: string };
  readonly overview: readonly string[];
  readonly applications: readonly string[];
  readonly publication: { readonly title: string; readonly label: string; readonly href: string };
  readonly access: {
    readonly status: string;
    readonly title: string;
    readonly description: string;
    readonly note: string;
    readonly email: string;
  };
  readonly resources: readonly TechnologyResource[];
}

/** One record supplies the hub, detail route, resources, metadata and contact link. */
const technologies: readonly Technology[] = [
  {
    slug: "dnd-seq",
    name: "D&D-seq",
    category: "Single-cell · DNA–protein interactions",
    status: "published",
    summary: "Capturing DNA–protein interactions, one cell at a time.",
    image: {
      src: "/technology-images/dnd-seq.svg",
      alt: "Conceptual illustration of a DNA strand and molecular interactions within a single cell.",
    },
    overview: [
      "D&D-seq (docking and deamination followed by sequencing) maps DNA–protein interactions in individual cells, including weak or transient binding.",
      "Its compatibility with established single-cell multiomic workflows allows protein binding to be studied alongside chromatin accessibility, gene expression, or targeted genotype information.",
    ],
    applications: [
      "Map cell-type-specific transcription factor binding in heterogeneous primary samples.",
      "Study regulatory changes during differentiation by connecting factor binding with chromatin accessibility and gene expression.",
      "Investigate mutation-associated changes in DNA–protein interactions.",
    ],
    publication: {
      title: "Single-cell mapping of regulatory DNA-protein interactions",
      label: "Cell · 2026",
      href: "https://doi.org/10.1016/j.cell.2026.05.014",
    },
    access: {
      status: "Enquire about a starter kit",
      title: "Try D&D-seq in your lab.",
      description: "Interested in an enzyme starter kit? Tell us about your research question, your institution, and the system you would like to study. We can discuss whether D&D-seq is a good fit for your project.",
      note: "Availability and material-transfer details are confirmed individually after an interest request. An enquiry is not an order or a guarantee of supply.",
      email: "ivr4003@med.cornell.edu",
    },
    resources: [
      { title: "Application note / white paper", description: "Scientific context, applications, and considerations for planning a study.", status: "coming-soon" },
      { title: "Detailed protocol", description: "A carefully prepared guide to the experimental workflow.", status: "coming-soon" },
    ],
  },
];

export function getPublishedTechnologies(): readonly Technology[] {
  return technologies.filter((technology) => technology.status === "published");
}

export function getTechnology(slug: string): Technology | undefined {
  return getPublishedTechnologies().find((technology) => technology.slug === slug);
}

export function technologyContactHref(technology: Technology): string {
  const subject = `${technology.name} — starter kit interest`;
  const body = `Hello Ivan,\n\nI’m interested in trying ${technology.name}.\n\nName:\nInstitution / lab:\nResearch question / project:\nBiological system:\n\nThank you.`;
  return `mailto:${technology.access.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getTechnologyMetadata(technology?: Technology): Metadata {
  const title = `${technology ? `${technology.name} | Try our technologies` : "Try our technologies"} | Technology Innovation Lab`;
  const description = technology?.summary ?? "Explore our technologies, their scientific applications, and ways to try them in your own lab. Start with D&D-seq.";
  const canonical = `https://raimonditechnologyinnovationlab.github.io/website/technologies/${technology ? `${technology.slug}/` : ""}`;
  const image = "https://raimonditechnologyinnovationlab.github.io/website/og-til-cells-2026-09-30-v3.png";
  return {
    title, description, alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", images: [{ url: image, width: 1200, height: 630, alt: "Technology Innovation Lab" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
