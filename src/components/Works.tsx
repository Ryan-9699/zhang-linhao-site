"use client";

import { motion } from "framer-motion";
import { ExternalLink, Search, Eye, ArrowRight } from "lucide-react";
import Image from "next/image";
import type { WorkItem } from "@/types/content";

interface WorksProps {
  works: WorkItem[];
}

const iconMap: Record<string, React.ReactNode> = {
  ExternalLink: <ExternalLink className="w-4 h-4" />,
  Search: <Search className="w-4 h-4" />,
  Eye: <Eye className="w-4 h-4" />,
  ArrowRight: <ArrowRight className="w-4 h-4" />,
};

export default function Works({ works }: WorksProps) {
  return (
    <section className="bg-[#0A0E27] px-6 md:px-12 lg:px-20 pb-20">
      {works.map((work, i) => (
        <motion.div
          key={work.id}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: i * 0.1 }}
          className="mb-16 md:mb-24"
        >
          {/* Section header */}
          <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter">
              {work.title}
            </h2>
            <span className="text-2xl md:text-3xl font-bold text-white/40">{work.id}</span>
          </div>

          {/* Work card */}
          <div className="relative rounded-3xl overflow-hidden bg-[#111530] border border-white/5">
            <div className="flex flex-col lg:flex-row">
              {/* Image area */}
              <div className="lg:w-3/5 relative aspect-[4/3] lg:aspect-auto lg:min-h-[480px] bg-[#0d1130]">
                {work.image ? (
                  <Image
                    src={work.image}
                    alt={work.subtitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/30">
                    <div className="text-center">
                      <div className="text-6xl font-black mb-2 opacity-20">{work.title}</div>
                      <p className="text-sm">将图片放入 public/images/ 目录</p>
                      <p className="text-xs text-white/20 mt-1">并在 content.json 中配置 image 路径</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info area */}
              <div className="lg:w-2/5 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {work.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{work.subtitle}</h3>
                  <p className="text-sm text-white/60">{work.description}</p>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  {work.links.map((link) => (
                    <motion.button
                      key={link.label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors border border-white/10"
                    >
                      {iconMap[link.icon] || <ExternalLink className="w-4 h-4" />}
                      {link.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </section>
  );
}
