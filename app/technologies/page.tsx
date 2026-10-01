import { EditorialFooter, EditorialHeader } from "../editorial/shell";
import { TechnologyHub } from "./components";
import { getTechnologyMetadata } from "./content";

export const dynamic = "force-static";
export const metadata = getTechnologyMetadata();

export default function TechnologiesPage() {
  return <div className="editorial-shell technology-shell">
    <EditorialHeader active="technologies" />
    <main id="main" tabIndex={-1}><TechnologyHub /></main>
    <EditorialFooter />
  </div>;
}
