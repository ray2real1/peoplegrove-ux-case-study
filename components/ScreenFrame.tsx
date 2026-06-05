import Image from "next/image";

type ScreenFrameProps = {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  priority?: boolean;
};

export function ScreenFrame({
  src,
  alt,
  label,
  className = "",
  priority = false
}: ScreenFrameProps) {
  return (
    <figure className={`group m-0 ${className}`}>
      <div className="relative aspect-[390/844] overflow-hidden rounded-[2rem] border border-white/[0.12] bg-midnight shadow-card ring-1 ring-white/[0.04]">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 45vw, 280px"
          className="object-cover transition duration-500 group-hover:scale-[1.015]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/[0.28] via-transparent to-white/[0.03]" />
      </div>
      {label && (
        <figcaption className="mt-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-ice/55">
          {label}
        </figcaption>
      )}
    </figure>
  );
}
