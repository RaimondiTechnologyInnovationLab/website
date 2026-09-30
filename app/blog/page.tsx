import { EditorialArchive } from "../editorial/components";
import { getEditorialMetadata } from "../editorial/content";
import { EditorialFooter, EditorialHeader } from "../editorial/shell";

export const dynamic = "force-static";

export const metadata = getEditorialMetadata("blog");

export default function BlogPage() {
  return (
    <div className="editorial-shell">
      <EditorialHeader active="blog" />
      <main id="main" tabIndex={-1}><EditorialArchive kind="blog" /></main>
      <EditorialFooter />
    </div>
  );
}
