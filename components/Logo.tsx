export function LogoMark({ className = "h-10 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 72 96" fill="none" aria-hidden>
      <defs>
        <linearGradient id="elvaro-gold" x1="8" y1="4" x2="68" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E6D275" />
          <stop offset="0.45" stopColor="#C5A059" />
          <stop offset="1" stopColor="#8A6E2F" />
        </linearGradient>
      </defs>
      <path fill="url(#elvaro-gold)" d="M10 6h12v84H10z" />
      <path fill="url(#elvaro-gold)" d="M26 8h40l-16 18H26z" />
      <path fill="url(#elvaro-gold)" d="M26 39h36l-16 18H26z" />
      <path fill="url(#elvaro-gold)" d="M26 70h32l-16 18H26z" />
    </svg>
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
      <LogoMark className={compact ? "h-8 w-6" : "h-11 w-8"} />
      <span className="leading-none">
        <span
          className={`block font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[0.28em] ${
            light ? "text-[#EDE8DE]" : "text-[#C5A059]"
          }`}
        >
          ELVARO
        </span>
        {!compact && (
          <span
            className={`mt-1 block text-[9px] font-medium tracking-[0.22em] uppercase ${
              light ? "text-[#EDE8DE]/70" : "text-[#8A6E2F]"
            }`}
          >
            by AIR GO SHOES
          </span>
        )}
      </span>
    </span>
  );
}
