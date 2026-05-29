import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const contentPath = path.join(root, "public", "content.json");
const optimizedRoot = path.join(root, "public", "optimized-uploads");

const content = JSON.parse(await readFile(contentPath, "utf8"));
await mkdir(optimizedRoot, { recursive: true });

function collectImageRefs(data) {
  const refs = new Set();
  if (data.profile?.avatar) refs.add(data.profile.avatar);

  for (const work of data.works ?? []) {
    for (const key of ["image", "videoImage"]) {
      if (work[key]) refs.add(work[key]);
    }
    for (const value of Object.values(work.galleryImages ?? {})) {
      if (value) refs.add(value);
    }
  }

  return refs;
}

function optimizedRefFor(ref) {
  if (!ref.startsWith("/uploads/") || ref.startsWith("/optimized-uploads/")) return ref;
  const basename = path.basename(ref, path.extname(ref));
  return `/optimized-uploads/${basename}.webp`;
}

async function optimizeRef(ref) {
  if (!ref.startsWith("/uploads/") || ref.startsWith("/optimized-uploads/")) return ref;

  const source = path.join(root, "public", ref);
  const targetRef = optimizedRefFor(ref);
  const target = path.join(root, "public", targetRef);

  try {
    await stat(source);
  } catch {
    return ref;
  }

  await sharp(source, { limitInputPixels: false })
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72, effort: 5 })
    .toFile(target);

  return targetRef;
}

const replacements = new Map();
for (const ref of collectImageRefs(content)) {
  const optimized = await optimizeRef(ref);
  replacements.set(ref, optimized);
}

function replaceRefs(value) {
  if (typeof value === "string") return replacements.get(value) ?? value;
  if (Array.isArray(value)) return value.map(replaceRefs);
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      value[key] = replaceRefs(child);
    }
  }
  return value;
}

replaceRefs(content);
await writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`);

let originalBytes = 0;
let optimizedBytes = 0;
for (const [original, optimized] of replacements.entries()) {
  if (original === optimized) continue;
  try {
    originalBytes += (await stat(path.join(root, "public", original))).size;
    optimizedBytes += (await stat(path.join(root, "public", optimized))).size;
  } catch {
    // Ignore missing files in the report.
  }
}

const originalRefs = [...replacements.keys()];
console.log(`optimized ${[...replacements.values()].filter((value, index) => value !== originalRefs[index]).length} images`);
console.log(`original ${(originalBytes / 1024 / 1024).toFixed(1)} MB -> optimized ${(optimizedBytes / 1024 / 1024).toFixed(1)} MB`);
