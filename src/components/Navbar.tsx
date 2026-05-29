"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface NavbarProps {
  categories: string[];
}

export default function Navbar({ categories }: NavbarProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12 lg:px-20"
    >
      <div className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar">
        {categories.map((cat, i) => (
          <span key={cat} className="flex items-center gap-4 md:gap-6 whitespace-nowrap">
            <span className="text-xs md:text-sm text-white/90 tracking-wide cursor-pointer hover:text-white transition-colors">
              {cat}
            </span>
            {i < categories.length - 1 && (
              <span className="w-2 h-2 rounded-full border border-white/60" />
            )}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Flame className="w-6 h-6 text-white" />
      </div>
    </motion.nav>
  );
}
