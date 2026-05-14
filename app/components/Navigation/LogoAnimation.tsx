"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// Reusable animation settings
import type { Transition } from "framer-motion";

const ENTRANCE_TRANSITION: Transition = {
  duration: 1.2,
  ease: [0.22, 1, 0.36, 1] as any,
};

const FLOAT_TRANSITION: Transition = {
  duration: 3,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut" as any,
};

export default function LogoAnimation() {
  return (
    <section className="flex min-h-[60vh] w-full items-center justify-center px-4 overflow-hidden">
      <motion.div
        // Initial state (Hidden/Offset)
        initial={{ opacity: 0, scale: 0.8, y: 30, rotate: -5 }}
        // Entrance sequence
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: [30, 0], // Move up
          rotate: 0 
        }}
        // The key to "Smoothness": Transition orchestration
        transition={ENTRANCE_TRANSITION}
        // Nesting the hover/float logic
        className="relative w-full max-w-[280px] md:max-w-[400px] aspect-square"
      >
        <motion.div
          // This separate motion div handles the infinite floating 
          // without interrupting the entrance animation logic
          animate={{ y: [0, -12, 0] }}
          transition={FLOAT_TRANSITION}
          className="w-full h-full"
        >
          <Image
            src="/Daleeli-logo.svg"
            alt="Daleeli Logo"
            fill // Better for responsiveness than hardcoded width/height
            priority
            className="object-contain"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}