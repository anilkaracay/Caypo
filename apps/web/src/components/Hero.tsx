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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background text-sm text-muted">
              <span className="w-2 h-2 rounded-full bg-accent" />
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
            {/* Canton — layered hexagon mark */}
            <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z" stroke="#A78BFA" strokeWidth="1.5"/>
              <path d="M12 6l5 2.8v6.4L12 18l-5-2.8V8.8L12 6z" stroke="#A78BFA" strokeWidth="1.2" opacity="0.6"/>
              <circle cx="12" cy="12" r="2" fill="#A78BFA" opacity="0.8"/>
            </svg>
            Canton Network
          </a>
          <a href="https://mpp.dev" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium text-[#818CF8] bg-[rgba(99,91,255,0.12)] hover:bg-[rgba(99,91,255,0.20)] transition-colors">
            {/* Stripe S mark */}
            <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="#818CF8">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
            </svg>
            MPP — Stripe × Tempo
          </a>
          <span
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium text-[#60A5FA] bg-[rgba(39,117,202,0.12)] hover:bg-[rgba(39,117,202,0.20)] transition-colors">
            {/* USDC dollar circle mark */}
            <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#60A5FA" strokeWidth="1.5"/>
              <path d="M12 6v1.5m0 9V18m-2.5-4.5c0 1.1.9 2 2.5 2s2.5-.7 2.5-2c0-1.5-2-1.8-2.5-2-.8-.3-2.5-.7-2.5-2 0-1.2 1-2 2.5-2s2.5.9 2.5 2" stroke="#60A5FA" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            USDCx by Circle
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
