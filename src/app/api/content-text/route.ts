import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { ContentData, WorkItem } from "@/types/content";

export const runtime = "nodejs";

const editableWorkFields = new Set<keyof WorkItem | "tags">([
  "subtitle",
  "description",
  "showcaseTitle",
  "showcaseDescription",
  "resultText",
  "tags",
]);

const editableProfileFields = new Set(["name", "phone", "email", "city", "salary", "role"]);
const editableHeroFields = new Set(["subtitle", "mainText"]);
const editableSiteFields = new Set(["title", "author"]);
const editableFooterFields = new Set(["contact", "copyright"]);
const editableMetricFields = new Set(["value", "label"]);
const editableExperienceFields = new Set(["company", "role", "period", "position"]);

export async function POST(request: Request) {
  const body = (await request.json()) as {
    target?: string;
    value?: string;
  };

  const [kind, id, field, index] = body.target?.split(":") ?? [];
  const value = typeof body.value === "string" ? body.value.trim() : undefined;

  if (!kind || typeof value !== "string") {
    return NextResponse.json({ error: "Invalid edit target." }, { status: 400 });
  }

  const contentPath = path.join(process.cwd(), "public", "content.json");
  const content = JSON.parse(await readFile(contentPath, "utf8")) as ContentData;

  if (kind === "work" && id && field && (editableWorkFields.has(field as keyof WorkItem | "tags") || field === "galleryText")) {
    const work = content.works.find((item) => item.id === id);
    if (!work) {
      return NextResponse.json({ error: "Work item not found." }, { status: 404 });
    }
    if (field === "galleryText" && index) {
      const editableGalleryTextFields = new Set([
        "onsiteTitle",
        "onsiteDescription",
        "signalTitle",
        "signalDescription",
        "outputTitle",
        "outputDescription",
      ]);
      if (!editableGalleryTextFields.has(index)) {
        return NextResponse.json({ error: "Gallery text field is not editable." }, { status: 400 });
      }
      work.galleryText = work.galleryText ?? {};
      (work.galleryText as Record<string, string>)[index] = value;
    } else if (field === "tags") {
      work.tags = [value];
    } else {
      (work as unknown as Record<string, string>)[field] = value;
    }
  } else if (kind === "profile" && id && content.profile && editableProfileFields.has(id)) {
    (content.profile as unknown as Record<string, string>)[id] = value;
  } else if (kind === "hero" && id && editableHeroFields.has(id)) {
    (content.hero as unknown as Record<string, string>)[id] = value;
  } else if (kind === "site" && id && editableSiteFields.has(id)) {
    (content.site as unknown as Record<string, string>)[id] = value;
  } else if (kind === "footer" && id && editableFooterFields.has(id)) {
    (content.footer as unknown as Record<string, string>)[id] = value;
  } else if (kind === "education") {
    content.education = value;
  } else if (kind === "metric" && id && field && editableMetricFields.has(field)) {
    const metric = content.profile?.metrics?.[Number(id)];
    if (!metric) {
      return NextResponse.json({ error: "Metric not found." }, { status: 404 });
    }
    (metric as unknown as Record<string, string>)[field] = value;
  } else if (kind === "experience" && id && field) {
    const job = content.experience?.[Number(id)];
    if (!job) {
      return NextResponse.json({ error: "Experience item not found." }, { status: 404 });
    }

    if (field === "highlight" && index) {
      if (!job.highlights[Number(index)]) {
        return NextResponse.json({ error: "Experience highlight not found." }, { status: 404 });
      }
      job.highlights[Number(index)] = value;
    } else if (editableExperienceFields.has(field)) {
      (job as unknown as Record<string, string>)[field] = value;
    } else {
      return NextResponse.json({ error: "Field is not editable from the page." }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Field is not editable from the page." }, { status: 400 });
  }

  await writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`);

  return NextResponse.json({ ok: true });
}
