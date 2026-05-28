"use client";

import Image from "next/image";

export function AtmosphericBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden bg-black">
      <div className="absolute inset-0 scale-[1.035]">
        <Image
          src="/backgrounds/eden-cathedral.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-58"
        />
      </div>
      <div className="absolute inset-0 vignette-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(79,184,255,0.18),transparent_18%),linear-gradient(90deg,rgba(0,0,0,0.68),rgba(0,0,0,0.18)_48%,rgba(0,0,0,0.78))]" />
      <div className="ray-layer absolute inset-0 opacity-35" />
      <div className="fog-layer absolute inset-0 opacity-55" />
      <div className="absolute inset-0 hidden sm:block">
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-white/18 blur-[1px] animate-drift"
            style={{
              width: `${2 + (index % 2)}px`,
              height: `${2 + (index % 2)}px`,
              left: `${12 + ((index * 13) % 76)}%`,
              top: `${18 + ((index * 17) % 68)}%`,
              animationDelay: `${index * 1.1}s`,
              opacity: 0.18 + (index % 3) * 0.08
            }}
          />
        ))}
      </div>
    </div>
  );
}
