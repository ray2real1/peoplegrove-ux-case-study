type DecisionCardProps = {
  number: string;
  title: string;
  body: string;
  stage?: string;
};

export function DecisionCard({ number, title, body, stage }: DecisionCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-panel/70 p-6 transition hover:border-sky/30">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky">
          {number}
        </p>
        {stage && (
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ice/55">
            {stage}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-ice/[0.68]">{body}</p>
    </article>
  );
}
