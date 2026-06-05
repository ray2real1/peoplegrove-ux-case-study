"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Screen } from "@/content/caseStudy";

type ScreenShowcaseProps = {
  screens: Screen[];
};

export function ScreenShowcase({ screens }: ScreenShowcaseProps) {
  const [active, setActive] = useState<Screen | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setActive(null);
    lastTrigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!active) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close]);

  return (
    <>
      <ul className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {screens.map((screen) => (
          <li key={screen.label}>
            <figure className="group m-0">
              <button
                type="button"
                onClick={(e) => {
                  lastTrigger.current = e.currentTarget;
                  setActive(screen);
                }}
                aria-label={`Enlarge ${screen.label} screen`}
                className="relative mx-auto block aspect-[390/844] w-full max-w-[300px] overflow-hidden rounded-[2rem] border border-white/12 bg-midnight shadow-card ring-1 ring-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-sky/40 hover:shadow-[0_30px_90px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
              >
                <span className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-ink/75 text-xs font-bold text-sky backdrop-blur">
                  {screen.step}
                </span>
                <Image
                  src={screen.src}
                  alt={screen.alt}
                  fill
                  sizes="(max-width: 640px) 75vw, (max-width: 1024px) 45vw, 300px"
                  className="object-contain transition duration-500 group-hover:scale-[1.02]"
                />
                <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/15 bg-ink/70 px-2.5 py-1 text-[0.65rem] font-medium text-ice/85 opacity-0 backdrop-blur transition group-hover:opacity-100">
                  Enlarge
                </span>
              </button>
              <figcaption className="mt-4 text-center">
                <span className="block text-xs font-medium uppercase tracking-[0.18em] text-ice/60">
                  {screen.step}. {screen.label}
                </span>
                <span className="mt-1 block text-sm text-ice/75">
                  &ldquo;{screen.decision}&rdquo;
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${active.label} screen, enlarged`}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/92 p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
          >
            Close
          </button>
          <figure
            onClick={(e) => e.stopPropagation()}
            className="m-0 flex max-h-full flex-col items-center"
          >
            <div className="relative h-[78vh] w-[min(360px,86vw)]">
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="360px"
                className="object-contain"
              />
            </div>
            <figcaption className="mt-4 text-center text-sm text-ice/80">
              <span className="font-semibold text-white">{active.label}</span>
              <span className="mx-2 text-ice/40">·</span>
              &ldquo;{active.decision}&rdquo;
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
