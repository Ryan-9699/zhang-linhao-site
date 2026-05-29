import { readFile } from "node:fs/promises";
import path from "node:path";
import AdminEditor from "@/components/AdminEditor";
import type { ContentData } from "@/types/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadContent() {
  const contentPath = path.join(process.cwd(), "public", "content.json");
  return JSON.parse(await readFile(contentPath, "utf8")) as ContentData;
}

export default async function AdminPage() {
  const content = await loadContent();
  return <AdminEditor initialContent={content} />;
}
