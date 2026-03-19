"use client";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 40%, var(--accent-glow), transparent)",
          }}
          className="w-full h-full"
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center gap-6 max-w-4xl"
      >
        {/* Badge */}
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface text-sm text-muted animate-breathe">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Built on Canton Network
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="font-display text-[56px] lg:text-[72px] leading-[1.05] tracking-[-0.02em] text-foreground"
        >
          A bank account for
          <br />
          <span className="text-accent">AI agents</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          variants={item}
          className="max-w-xl text-lg text-muted leading-relaxed"
        >
          Five accounts. One SDK. Zero friction. Checking, savings, credit,
          exchange, and investment — powered by USDCx and the Machine Payments
          Protocol.
        </motion.p>

        {/* Buttons */}
        <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <a
            href="/docs/getting-started"
            className="px-6 py-3 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors duration-200 shadow-lg shadow-accent/20"
          >
            Get Started
          </a>
          <a
            href="https://github.com/cayvox-labs/caypo"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg border border-border text-foreground font-medium text-sm hover:border-border-hover hover:bg-surface transition-colors duration-200"
          >
            View on GitHub
          </a>
        </motion.div>

        {/* Trust line */}
        <motion.p variants={item} className="text-xs text-muted tracking-wide">
          Canton Network · MPP · USDCx by Circle
        </motion.p>
      </motion.div>
    </section>
  );
}
