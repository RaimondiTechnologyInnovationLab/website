import { notFound } from "next/navigation";
import { EditorialArticle } from "../../editorial/components";
import { getEditorialMetadata, getPublishedEntries, getPublishedEntry } from "../../editorial/content";
import { EditorialFooter, EditorialHeader } from "../../editorial/shell";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedEntries("blog").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const entry = getPublishedEntry("blog", slug);
  if (!entry) notFound();
  return getEditorialMetadata("blog", entry);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const entry = getPublishedEntry("blog", slug);
  if (!entry) notFound();
  return (
    <div className="editorial-shell">
      <EditorialHeader active="blog" />
      <main id="main" tabIndex={-1}><EditorialArticle kind="blog" entry={entry} /></main>
      <EditorialFooter />
    </div>
  );
}
