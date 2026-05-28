"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export function AtmosphericBackdrop() {
  const { scrollY } = useScroll();
  const translateY = useTransform(scrollY, [0, 1000], [0, 80]);
  const scale = useTransform(scrollY, [0, 1200], [1.02, 1.08]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: translateY, scale }}>
        <Image
          src="/backgrounds/eden-cathedral.png"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-55 blur-[1px]"
        />
      </motion.div>
      <div className="absolute inset-0 vignette-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(100,184,255,0.18),transparent_30%),linear-gradient(180deg,rgba(1,2,4,0.3),rgba(2,4,8,0.92))]" />
      <div className="ray-layer absolute inset-0 opacity-60" />
      <div className="fog-layer absolute inset-0 opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(87,197,255,0.24),transparent_14%),radial-gradient(circle_at_50%_16%,rgba(214,244,255,0.15),transparent_12%)]" />
      <div className="absolute inset-0">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-white/20 blur-sm animate-drift"
            style={{
              width: `${2 + (index % 3)}px`,
              height: `${2 + (index % 3)}px`,
              left: `${(index * 7) % 100}%`,
              top: `${(index * 11) % 100}%`,
              animationDelay: `${index * 0.7}s`,
              opacity: 0.25 + (index % 4) * 0.1
            }}
          />
        ))}
      </div>
    </div>
  );
}
