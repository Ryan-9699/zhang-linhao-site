import { readFile } from "node:fs/promises";
import path from "node:path";
import PortfolioSite from "@/components/PortfolioSite";
import type { ContentData } from "@/types/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadContent() {
  const contentPath = path.join(process.cwd(), "public", "content.json");
  return JSON.parse(await readFile(contentPath, "utf8")) as ContentData;
}

export default async function Home() {
  const content = await loadContent();
  return <PortfolioSite initialContent={content} />;
}
