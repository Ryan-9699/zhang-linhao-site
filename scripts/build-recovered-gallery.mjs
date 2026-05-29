import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "uploads", "recovered");
const files = (await readdir(dir))
  .filter((file) => /\.(png|jpe?g|webp|gif|avif)$/i.test(file))
  .sort();

const items = await Promise.all(
  files.map(async (file) => {
    const fileStat = await stat(path.join(dir, file));
    return { file, size: fileStat.size };
  }),
);

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recovered Images</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #161616;
      background: #f4f4f1;
    }
    main {
      max-width: 1440px;
      margin: 0 auto;
      padding: 28px 18px 44px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 26px;
    }
    p {
      margin: 0 0 22px;
      color: #555;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
    }
    article {
      overflow: hidden;
      border: 1px solid #d8d8d2;
      border-radius: 8px;
      background: #fff;
    }
    img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 10;
      object-fit: contain;
      background: #151515;
    }
    div {
      padding: 10px 12px 12px;
    }
    strong {
      display: block;
      margin-bottom: 4px;
      font-size: 13px;
      word-break: break-all;
    }
    span {
      display: block;
      color: #686868;
      font-size: 12px;
    }
    a {
      display: inline-flex;
      margin-top: 9px;
      color: #1458a8;
      font-size: 13px;
      font-weight: 650;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <main>
    <h1>Recovered Images</h1>
    <p>${items.length} images recovered from Chrome IndexedDB for localhost:3000.</p>
    <section class="grid">
      ${items
        .map(
          ({ file, size }) => `<article>
        <img src="./${file}" alt="${file}" loading="lazy">
        <div>
          <strong>${file}</strong>
          <span>${(size / 1024 / 1024).toFixed(2)} MB</span>
          <a href="./${file}" target="_blank" rel="noreferrer">打开原图</a>
        </div>
      </article>`,
        )
        .join("\n")}
    </section>
  </main>
</body>
</html>
`;

await writeFile(path.join(dir, "index.html"), html);
