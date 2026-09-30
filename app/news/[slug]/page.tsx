import { notFound } from "next/navigation";
import { EditorialArticle } from "../../editorial/components";
import { getEditorialMetadata, getPublishedEntries, getPublishedEntry } from "../../editorial/content";
import { EditorialFooter, EditorialHeader } from "../../editorial/shell";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedEntries("news").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const entry = getPublishedEntry("news", slug);
  if (!entry) notFound();
  return getEditorialMetadata("news", entry);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const entry = getPublishedEntry("news", slug);
  if (!entry) notFound();
  return (
    <div className="editorial-shell">
      <EditorialHeader active="news" />
      <main id="main" tabIndex={-1}><EditorialArticle kind="news" entry={entry} /></main>
      <EditorialFooter />
    </div>
  );
}
