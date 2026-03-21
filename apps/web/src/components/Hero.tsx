"use client";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center overflow-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute"
        aria-hidden
        style={{
          width: 600,
          height: 400,
          left: "50%",
          top: "50%",
          background:
            "radial-gradient(ellipse, rgba(59,130,246,0.12), transparent 70%)",
          animation: "hero-breathe 8s infinite",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center gap-6 max-w-4xl"
      >
        {/* Badge with spinning border */}
        <motion.div variants={item}>
          <div
            className="relative rounded-full p-px"
            style={{
              background:
                "conic-gradient(from var(--badge-angle), transparent 60%, #3B82F6 80%, transparent 100%)",
              animation: "spin-badge 4s linear infinite",
            }}
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-background text-sm text-muted">
              Built on Canton Network
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="font-[family-name:var(--font-instrument-serif)] text-[56px] lg:text-[72px] leading-[1.05] tracking-[-0.03em] text-foreground"
        >
          Agent finance on
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #3B82F6, #60A5FA, #93C5FD)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            institutional rails
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          variants={item}
          className="text-muted text-lg max-w-lg mx-auto"
        >
          Everything an agent needs. One SDK.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center gap-4 mt-2"
        >
          <a
            href="/docs#quickstart"
            className="px-6 py-3 rounded-lg bg-accent text-white font-medium text-sm hover:brightness-110 transition-all duration-200"
          >
            Get Started
          </a>
          <a
            href="https://github.com/anilkaracay/Caypo"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg border border-border text-foreground font-medium text-sm hover:border-border-hover transition-colors duration-200"
          >
            View on GitHub
          </a>
        </motion.div>

        {/* Partner badges */}
        <motion.div
          variants={item}
          className="flex flex-wrap justify-center gap-3 mt-4"
        >
          <a href="https://canton.network" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium text-[#A78BFA] bg-[rgba(139,92,246,0.12)] hover:bg-[rgba(139,92,246,0.20)] transition-colors">
            <img src="/logos/canton-icon.png" alt="Canton" width={16} height={16} className="w-4 h-4 shrink-0" />
            Canton Network
          </a>
          <a href="https://mpp.dev" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium text-[#F8FAFC] bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)] transition-colors">
            <img src="/logos/tempo.svg" alt="Tempo" width={16} height={16} className="w-4 h-4 shrink-0" style={{ filter: "brightness(0) invert(1)" }} />
            MPP — Stripe × Tempo
          </a>
          <span
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium text-[#60A5FA] bg-[rgba(39,117,202,0.12)] hover:bg-[rgba(39,117,202,0.20)] transition-colors">
            <img src="/logos/circle.svg" alt="Circle" width={16} height={16} className="w-4 h-4 shrink-0" />
            USDCx by Circle
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
