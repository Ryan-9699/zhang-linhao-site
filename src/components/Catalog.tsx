"use client";

import { motion } from "framer-motion";
import type { CatalogConfig } from "@/types/content";

interface CatalogProps {
  data: CatalogConfig;
}

export default function Catalog({ data }: CatalogProps) {
  return (
    <section className="relative bg-[#0A0E27] py-16 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Left sidebar title */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:w-32 flex-shrink-0"
        >
          <div className="lg:sticky lg:top-32">
            <h2
              className="text-4xl md:text-5xl font-black tracking-tighter text-white"
              style={{ writingMode: "vertical-lr", textOrientation: "mixed" }}
            >
              {data.title}
            </h2>
          </div>
        </motion.div>

        {/* Catalog cards */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative rounded-3xl p-6 md:p-8 border border-white/10 hover:border-white/20 transition-colors"
              style={{ backgroundColor: `${cat.color}15` }}
            >
              <div
                className="absolute top-4 right-4 text-4xl md:text-5xl font-black opacity-30"
                style={{ color: cat.color }}
              >
                {cat.id}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-4">{cat.name}</h3>
              <ul className="space-y-2">
                {cat.items.map((item) => (
                  <li key={item} className="text-sm text-white/70 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cat.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
