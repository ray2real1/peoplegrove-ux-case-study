import type { ReactNode } from "react";

type ProjectCardProps = {
  title: string;
  children: ReactNode;
  accent?: boolean;
};

export function ProjectCard({ title, children, accent = false }: ProjectCardProps) {
  return (
    <article
      className={`rounded-3xl border p-6 ${
        accent
          ? "border-sky/30 bg-sky/10"
          : "border-white/10 bg-white/[0.045]"
      }`}
    >
      <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-6 text-ice/70">{children}</div>
    </article>
  );
}
