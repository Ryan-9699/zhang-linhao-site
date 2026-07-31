import { readFile } from "node:fs/promises";
import path from "node:path";
import RetroPortfolioSite from "@/components/RetroPortfolioSite";
import type { ContentData } from "@/types/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadContent() {
  const contentPath = path.join(process.cwd(), "public", "retro-content.json");
  return JSON.parse(await readFile(contentPath, "utf8")) as ContentData;
}

export default async function RetroPage() {
  const content = await loadContent();
  return <RetroPortfolioSite initialContent={content} />;
}
