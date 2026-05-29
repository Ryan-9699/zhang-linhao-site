import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "张林浩 | 视觉技术专家",
  description: "张林浩个人网站：直播技术、影像摄影、视音频系统架构与大型项目执行经验。",
  openGraph: {
    title: "张林浩 | 视觉技术专家",
    description: "6年资深经验，聚焦大型直播技术、电影级影像采集、信号回传与项目统筹。",
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
