import Home from "./home";
import { EditorialPreview } from "./editorial/components";

export default function Page() {
  return <Home newsPreview={<EditorialPreview kind="news" />} blogPreview={<EditorialPreview kind="blog" />} />;
}
