import content from "../../public/content.json";
import HaylerInspiredSite from "@/components/HaylerInspiredSite";
import type { ContentData } from "@/types/content";

export default function Home() {
  return <HaylerInspiredSite initialContent={content as ContentData} />;
}
