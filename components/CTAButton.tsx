import Link from "next/link";
import type { ReactNode } from "react";

type CTAButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  external?: boolean;
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  external = false
}: CTAButtonProps) {
  const variants = {
    primary:
      "border-sky/50 bg-sky text-ink shadow-[0_16px_48px_rgba(120,183,255,0.24)] hover:bg-white",
    secondary:
      "border-white/[0.18] bg-white/[0.07] text-white hover:border-sky/50 hover:bg-sky/10",
    ghost: "border-transparent bg-transparent text-ice/75 hover:text-white"
  };

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`group inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full border px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky ${variants[variant]}`}
    >
      {children}
      {external && (
        <>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 opacity-70 transition group-hover:opacity-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </Link>
  );
}
