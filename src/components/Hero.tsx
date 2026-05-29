"use client";

import { motion } from "framer-motion";
import { Smile } from "lucide-react";
import OrbitLines from "./OrbitLines";
import type { HeroConfig } from "@/types/content";

interface HeroProps {
  data: HeroConfig;
}

export default function Hero({ data }: HeroProps) {
  const titleWords = data.mainText.split(" ");

  return (
    <section className="relative min-h-screen bg-[#2E4BF0] overflow-hidden flex flex-col">
      <OrbitLines />

      <div className="relative z-10 flex-1 flex flex-col px-6 md:px-12 lg:px-20 pt-8 pb-12">
        {/* Title row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap items-start gap-x-6 md:gap-x-10 gap-y-2 mt-8"
        >
          {data.titleLines.map((line, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                {line}
              </span>
              {i === 0 && (
                <span className="text-xs md:text-sm text-white/80 mt-1">{data.subtitle}</span>
              )}
              {i === 1 && (
                <span className="text-xs md:text-sm text-white/80 mt-1">{data.searchLabel} <span className="text-white">{data.searchValue}</span></span>
              )}
              {i === 2 && (
                <span className="text-xs md:text-sm text-white/80 mt-1">{data.exchangeLabel}<br />{data.exchangeValue}</span>
              )}
            </div>
          ))}

          {/* Orange tag */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6, type: "spring" }}
            className="ml-auto md:ml-4 w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#FF7A45] flex flex-col items-center justify-center text-center shadow-lg animate-float"
          >
            <span className="text-[10px] md:text-xs font-bold text-white leading-tight whitespace-pre-line">{data.tagText}</span>
            <Smile className="w-4 h-4 text-white mt-1" />
          </motion.div>
        </motion.div>

        {/* Main big text with glass panels */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex-1 flex items-center justify-center my-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {titleWords.map((word, wordIdx) => (
              <div key={wordIdx} className="flex">
                {word.split("").map((char, charIdx) => (
                  <motion.div
                    key={`${wordIdx}-${charIdx}`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + (wordIdx * word.length + charIdx) * 0.05 }}
                    className="glass-panel w-12 h-16 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-2xl flex items-center justify-center mx-0.5"
                  >
                    <span className="text-2xl md:text-4xl lg:text-5xl font-black text-white/90">
                      {char}
                    </span>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom area */}
        <div className="flex items-end justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xs md:text-sm font-bold text-white/90 tracking-wider whitespace-pre-line"
          >
            {data.bottomLeft}
          </motion.div>

          {/* Arc text placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="relative w-24 h-24 md:w-32 md:h-32"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow" style={{ animation: "orbit-rotate 20s linear infinite" }}>
              <defs>
                <path id="circlePath" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
              </defs>
              <text fill="white" fontSize="10" fontWeight="bold" letterSpacing="2">
                <textPath href="#circlePath">
                  {data.arcText} · {data.arcText} ·
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-right"
          >
            <div className="text-xs md:text-sm text-white/90 whitespace-pre-line">{data.motto}</div>
          </motion.div>
        </div>
      </div>

      {/* Dashed separator */}
      <div className="relative z-10 dashed-line mx-6 md:mx-12 lg:mx-20 mb-8" />
    </section>
  );
}
