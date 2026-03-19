"use client";

import { motion } from "framer-motion";
import { FLOW_STEPS } from "@/lib/constants";

const stepVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

export default function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header — left aligned */}
        <div className="mb-12">
          <h2 className="text-2xl font-sans font-semibold text-foreground">
            How agents pay{" "}
            <span className="font-[family-name:var(--font-instrument-serif)] italic text-accent">
              with CAYPO
            </span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative ml-6">
          {/* Vertical line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-border"
            aria-hidden
          />
          {/* Animated dot */}
          <div
            className="absolute left-[-2.5px] w-[6px] h-[6px] rounded-full bg-accent"
            style={{ animation: "flow-down 3s infinite" }}
            aria-hidden
          />

          <div className="flex flex-col gap-8">
            {FLOW_STEPS.map((step, index) => {
              const isHighlighted = index === 2;
              return (
                <motion.div
                  key={step.num}
                  custom={index}
                  variants={stepVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="relative pl-10"
                >
                  {/* Number circle on the timeline */}
                  <div
                    className={[
                      "absolute left-[-16px] w-8 h-8 rounded-full border flex items-center justify-center text-sm font-[family-name:var(--font-geist-mono)]",
                      isHighlighted
                        ? "border-accent bg-accent text-background"
                        : "border-border bg-background text-muted",
                    ].join(" ")}
                  >
                    {step.num}
                  </div>

                  {/* Card */}
                  <div
                    className={[
                      "rounded-xl p-5 border",
                      isHighlighted
                        ? "border-accent/30 bg-accent/5"
                        : "border-border bg-surface",
                    ].join(" ")}
                  >
                    <p
                      className={[
                        "font-medium text-sm mb-2",
                        isHighlighted ? "text-accent" : "text-foreground",
                      ].join(" ")}
                    >
                      {step.title}
                    </p>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 font-[family-name:var(--font-geist-mono)] text-sm text-muted overflow-x-auto">
                      {step.code}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
