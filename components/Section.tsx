"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  className?: string;
};

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className = ""
}: SectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      aria-labelledby={id && title ? `${id}-heading` : undefined}
      className={`mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:px-10 lg:py-24 ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {(eyebrow || title || intro) && (
        <div className="mb-10 max-w-3xl">
          {eyebrow && (
            <p className="mb-4 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-sky">
              <span aria-hidden="true" className="h-px w-6 bg-sky/50" />
              {eyebrow}
            </p>
          )}
          {title && (
            <h2
              id={id ? `${id}-heading` : undefined}
              className="text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl"
            >
              {title}
            </h2>
          )}
          {intro && (
            <p className="mt-5 text-pretty text-base leading-7 text-ice/[0.72] sm:text-lg">
              {intro}
            </p>
          )}
        </div>
      )}
      {children}
    </motion.section>
  );
}
