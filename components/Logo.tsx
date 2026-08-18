type MarkProps = {
  className?: string;
  alt?: string;
};

export function LogoMark({ className = "h-10 w-7", alt = "" }: MarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/elvaro-mark.svg" alt={alt} className={`logo-mark ${className}`} />
  );
}

export function ElvaroWordmark({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/elvaro-wordmark.svg" alt="ELVARO" className={`elvaro-wordmark ${className}`} />
  );
}

export function OfficialLockup({
  className = "h-40 w-auto",
  variant = "gold",
}: {
  className?: string;
  variant?: "gold" | "white" | "flat" | "svg";
}) {
  const src =
    variant === "white"
      ? "/brand/elvaro-lockup-white.jpg"
      : variant === "flat"
        ? "/brand/elvaro-lockup-flat.jpg"
        : variant === "svg"
          ? "/brand/elvaro-lockup.svg"
          : "/brand/elvaro-lockup-gold.jpg";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="ELVARO" className={`object-contain ${className}`} />
  );
}

export function BrandLockup({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark className={compact ? "h-9 w-6" : "h-11 w-8"} />
      <span className="leading-none">
        <ElvaroWordmark className={compact ? "h-4 w-auto" : "h-[18px] w-auto"} />
        {!compact && (
          <span
            className={`mt-1.5 block text-[9px] font-medium tracking-[0.22em] uppercase ${
              light ? "text-[#F5EFE4]/70" : "text-[var(--gold-dark)]"
            }`}
          >
            by AIR GO SHOES
          </span>
        )}
      </span>
    </span>
  );
}
