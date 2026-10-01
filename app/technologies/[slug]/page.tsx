import { notFound } from "next/navigation";
import { EditorialFooter, EditorialHeader } from "../../editorial/shell";
import { TechnologyDetail } from "../components";
import { getPublishedTechnologies, getTechnology, getTechnologyMetadata } from "../content";

type TechnologyPageProps = { params: Promise<{ slug: string }> };
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return getPublishedTechnologies().map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: TechnologyPageProps) {
  const { slug } = await params;
  const technology = getTechnology(slug);
  if (!technology) notFound();
  return getTechnologyMetadata(technology);
}
export default async function TechnologyPage({ params }: TechnologyPageProps) {
  const { slug } = await params;
  const technology = getTechnology(slug);
  if (!technology) notFound();
  return <div className="editorial-shell technology-shell">
    <EditorialHeader active="technologies" />
    <main id="main" tabIndex={-1}><TechnologyDetail technology={technology} /></main>
    <EditorialFooter />
  </div>;
}
