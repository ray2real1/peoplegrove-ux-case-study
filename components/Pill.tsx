import type { ReactNode } from "react";

type PillProps = {
  children: ReactNode;
  tone?: "default" | "blue" | "green";
};

export function Pill({ children, tone = "default" }: PillProps) {
  const tones = {
    default: "border-white/[0.12] bg-white/[0.06] text-ice/80",
    blue: "border-sky/30 bg-sky/10 text-sky",
    green: "border-mint/30 bg-mint/10 text-mint"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
