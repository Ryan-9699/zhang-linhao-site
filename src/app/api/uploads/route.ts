import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"]);
const allowedVideoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const maxVideoBytes = 90 * 1024 * 1024;

function safeExtension(file: File) {
  const fromType = extensionByType[file.type];
  if (fromType) return fromType;

  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return fromName || "jpg";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const isImage = allowedImageTypes.has(file.type);
  const isVideo = allowedVideoTypes.has(file.type);
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Only image/SVG and MP4/WebM/MOV video files are supported." }, { status: 400 });
  }

  if (isVideo && file.size > maxVideoBytes) {
    return NextResponse.json({ error: "Video is too large. Please keep it under 90MB." }, { status: 400 });
  }

  const publicDir = isVideo ? "videos" : "uploads";
  const uploadDir = path.join(process.cwd(), "public", publicDir);
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${crypto.randomUUID()}.${safeExtension(file)}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return NextResponse.json({ url: `/${publicDir}/${fileName}`, type: isVideo ? "video" : "image" });
}
