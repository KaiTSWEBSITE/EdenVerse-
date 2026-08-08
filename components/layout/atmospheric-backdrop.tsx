"use client";

import Image from "next/image";

const AURORA_LINES = [
  {
    top: "22%",
    background:
      "linear-gradient(90deg, transparent 0%, rgba(87,188,255,0.22) 28%, rgba(87,188,255,0.36) 50%, rgba(87,188,255,0.22) 72%, transparent 100%)",
    delay: "0s"
  },
  {
    top: "50%",
    background:
      "linear-gradient(90deg, transparent 5%, rgba(209,160,88,0.14) 35%, rgba(209,160,88,0.24) 55%, rgba(209,160,88,0.14) 78%, transparent 100%)",
    delay: "2.4s"
  },
  {
    top: "74%",
    background:
      "linear-gradient(90deg, transparent 0%, rgba(87,188,255,0.12) 32%, rgba(142,216,255,0.2) 52%, rgba(87,188,255,0.12) 70%, transparent 100%)",
    delay: "4.8s"
  }
];

const NEBULA_BLOBS = [
  {
    width: 460,
    height: 340,
    left: "58%",
    top: "6%",
    color: "rgba(79,184,255,0.09)",
    blur: 80,
    delay: "0s",
    duration: "10s"
  },
  {
    width: 380,
    height: 300,
    left: "2%",
    top: "52%",
    color: "rgba(209,160,88,0.07)",
    blur: 100,
    delay: "3.5s",
    duration: "13s"
  },
  {
    width: 260,
    height: 220,
    left: "34%",
    top: "26%",
    color: "rgba(87,188,255,0.06)",
    blur: 70,
    delay: "7s",
    duration: "9s"
  }
];

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  width: 1.2 + (i % 4) * 0.55,
  height: 1.2 + (i % 4) * 0.55,
  left: `${5 + ((i * 11 + 7) % 90)}%`,
  top: `${6 + ((i * 17 + 3) % 88)}%`,
  duration: `${17 + (i % 5) * 4}s`,
  delay: `${(i * 0.65) % 13}s`,
  opacity: 0.1 + (i % 6) * 0.055
}));

export function AtmosphericBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden bg-black">
      {/* Background image */}
      <div className="absolute inset-0 scale-[1.035]">
        <Image
          src="/backgrounds/eden-cathedral.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-52"
        />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 vignette-overlay" />

      {/* Base overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(79,184,255,0.2),transparent_22%),linear-gradient(90deg,rgba(0,0,0,0.74),rgba(0,0,0,0.16)_48%,rgba(0,0,0,0.84))]" />

      {/* Ray & fog layers */}
      <div className="ray-layer absolute inset-0 opacity-38" />
      <div className="fog-layer absolute inset-0 opacity-58" />

      {/* Nebula blobs */}
      <div className="absolute inset-0 hidden sm:block">
        {NEBULA_BLOBS.map((blob, i) => (
          <div
            key={i}
            className="nebula-blob absolute animate-float"
            style={{
              width: blob.width,
              height: blob.height,
              left: blob.left,
              top: blob.top,
              background: blob.color,
              filter: `blur(${blob.blur}px)`,
              animationDelay: blob.delay,
              animationDuration: blob.duration
            }}
          />
        ))}
      </div>

      {/* Aurora lines */}
      <div className="absolute inset-0 hidden lg:block overflow-hidden">
        {AURORA_LINES.map((line, i) => (
          <div
            key={i}
            className="aurora-line animate-aurora"
            style={{
              top: line.top,
              background: line.background,
              animationDelay: line.delay
            }}
          />
        ))}
      </div>

      {/* Particles */}
      <div className="absolute inset-0 hidden sm:block">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/20 blur-[0.6px]"
            style={{
              width: `${p.width}px`,
              height: `${p.height}px`,
              left: p.left,
              top: p.top,
              opacity: p.opacity,
              animation: `drift ${p.duration} linear infinite`,
              animationDelay: p.delay
            }}
          />
        ))}
      </div>
    </div>
  );
}
