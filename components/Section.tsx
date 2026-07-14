"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Scroll-reveal is progressive enhancement, not a prerequisite for reading.
 *
 * The section renders visible by default. The hidden-then-reveal state is only
 * applied when JS is available (`html.js`) and the user allows motion, so content
 * can never be stranded at opacity 0 if JS, hydration, or IntersectionObserver
 * fails. A timeout also force-reveals if the observer never fires.
 */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className = ""
}: SectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-120px 0px" }
    );
    observer.observe(el);

    // Safety net: if the observer never fires (headless capture, programmatic
    // scrolling, or an unsupported environment), reveal anyway.
    const fallback = window.setTimeout(() => {
      setRevealed(true);
      observer.disconnect();
    }, 1500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={id && title ? `${id}-heading` : undefined}
      className={`reveal ${revealed ? "reveal-visible" : ""} mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:px-10 lg:py-24 ${className}`}
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
    </section>
  );
}
