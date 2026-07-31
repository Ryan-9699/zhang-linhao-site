import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./final-overrides.css";

export const metadata: Metadata = {
  title: "张林浩 | AI视觉设计师 / AI视频生成师",
  description: "张林浩个人网站：AI视觉设计、AI视频生成、AIGC视觉效果制作、影视审美与大型内容项目经验。",
  openGraph: {
    title: "张林浩 | AI视觉设计师 / AI视频生成师",
    description: "6年影视摄影与大型直播项目经验，熟悉 Stable Diffusion、ComfyUI、Midjourney、GPT、即梦、可灵等 AIGC 工作流。",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
