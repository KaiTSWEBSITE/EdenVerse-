"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type RevealDirection = "bottom" | "left" | "right";

const directionOffsets: Record<RevealDirection, { x: number; y: number }> = {
  bottom: { y: 18, x: 0 },
  left: { y: 0, x: -24 },
  right: { y: 0, x: 24 }
};

export function Reveal({
  children,
  delay = 0,
  from = "bottom",
  blur = true
}: {
  children: React.ReactNode;
  delay?: number;
  from?: RevealDirection;
  blur?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const { x, y } = directionOffsets[from];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x, y, filter: blur ? "blur(6px)" : "blur(0px)" }}
      animate={
        inView
          ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }
          : undefined
      }
      transition={{
        duration: 0.65,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay
      }}
    >
      {children}
    </motion.div>
  );
}
