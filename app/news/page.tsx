import { EditorialArchive } from "../editorial/components";
import { getEditorialMetadata } from "../editorial/content";
import { EditorialFooter, EditorialHeader } from "../editorial/shell";

export const dynamic = "force-static";

export const metadata = getEditorialMetadata("news");

export default function NewsPage() {
  return (
    <div className="editorial-shell">
      <EditorialHeader active="news" />
      <main id="main" tabIndex={-1}><EditorialArchive kind="news" /></main>
      <EditorialFooter />
    </div>
  );
}
