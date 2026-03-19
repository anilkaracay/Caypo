"use client";

import { motion } from "framer-motion";
import { CANTON_ADVANTAGES } from "@/lib/constants";

const TOP_BORDERS = [
  "border-t-accent",
  "border-t-emerald",
  "border-t-purple-400",
  "border-t-amber-400",
  "border-t-rose-400",
  "border-t-accent",
];

const GRID_SPANS = [
  "md:col-span-2", // Privacy by Default — large
  "md:col-span-1", // Institutional Grade — medium
  "md:col-span-1", // Deterministic Settlement — small
  "md:col-span-1", // USDCx by Circle — small
  "md:col-span-1", // Traffic, Not Gas — small
  "md:col-span-3", // Cross-App Composable — full width
];

const containerVariant = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function WhyCanton() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-[family-name:var(--font-instrument-serif)] text-foreground mb-3">
            Why Canton Network?
          </h2>
          <p className="text-muted text-lg">
            Not all blockchains are built for finance.
          </p>
        </div>

        {/* Bento grid */}
        <motion.div
          variants={containerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {CANTON_ADVANTAGES.map((adv, i) => (
            <motion.div
              key={adv.title}
              variants={cardVariant}
              whileHover={{
                y: -2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
              className={[
                "bg-surface border border-border rounded-xl p-6 border-t-2 transition-colors duration-200 hover:border-border-hover",
                TOP_BORDERS[i],
                GRID_SPANS[i],
              ].join(" ")}
            >
              <h3
                className={[
                  "font-medium text-foreground mb-2",
                  i === 0 || i === 5 ? "text-xl" : "text-lg",
                ].join(" ")}
              >
                {adv.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{adv.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
