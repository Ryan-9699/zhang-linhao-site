import content from "../../../public/content.json";
import RetroPortfolioSite from "@/components/RetroPortfolioSite";
import type { ContentData } from "@/types/content";

export default function RetroPage() {
  return <RetroPortfolioSite initialContent={content as ContentData} />;
}
