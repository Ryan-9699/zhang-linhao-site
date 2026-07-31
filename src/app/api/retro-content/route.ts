import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { ContentData } from "@/types/content";

export const runtime = "nodejs";

const contentPath = path.join(process.cwd(), "public", "retro-content.json");

export async function GET() {
  const content = JSON.parse(await readFile(contentPath, "utf8")) as ContentData;
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  const content = (await request.json()) as ContentData;

  if (!content?.site || !content?.hero || !Array.isArray(content.works)) {
    return NextResponse.json({ error: "Invalid content payload." }, { status: 400 });
  }

  await writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`);
  return NextResponse.json({ ok: true });
}
