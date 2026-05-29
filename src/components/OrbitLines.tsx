"use client";

import { motion } from "framer-motion";

export default function OrbitLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Main large orbit */}
      <motion.svg
        className="absolute top-1/2 left-1/2 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 1000 800"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <motion.ellipse
          cx="500"
          cy="400"
          rx="420"
          ry="180"
          stroke="white"
          strokeWidth="2"
          fill="none"
          className="animate-orbit"
          style={{ transformOrigin: "center", opacity: 0.7 }}
        />
        <motion.ellipse
          cx="500"
          cy="400"
          rx="380"
          ry="320"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          className="animate-orbit"
          style={{ transformOrigin: "center", opacity: 0.5, animationDirection: "reverse", animationDuration: "45s" }}
        />
        <motion.ellipse
          cx="500"
          cy="400"
          rx="280"
          ry="260"
          stroke="white"
          strokeWidth="1"
          fill="none"
          className="animate-orbit"
          style={{ transformOrigin: "center", opacity: 0.4, animationDuration: "20s" }}
        />
      </motion.svg>
    </div>
  );
}
