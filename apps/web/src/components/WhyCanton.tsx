"use client";

import { motion } from "framer-motion";
import { CANTON_ADVANTAGES } from "@/lib/constants";

export default function WhyCanton() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-4 text-center">
          <p className="text-sm text-accent font-mono mb-3">Infrastructure</p>
          <h2 className="font-display text-4xl lg:text-5xl text-foreground tracking-tight mb-4">
            Why Canton Network?
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Not all blockchains are built for finance.
          </p>
        </div>

        {/* 3x2 grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CANTON_ADVANTAGES.map((adv, i) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, borderColor: "var(--border-hover)" }}
              className="rounded-xl border border-border bg-surface p-6 transition-colors duration-200"
            >
              <h3 className="font-medium text-foreground text-sm mb-2">
                {adv.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{adv.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
