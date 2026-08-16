import { useId } from "react";

function GoldE({ className = "h-10 w-8" }: { className?: string }) {
  const raw = useId().replace(/:/g, "");
  const gold = `eg-${raw}`;
  const bevel = `eb-${raw}`;
  const brush = `eu-${raw}`;
  const shadow = `es-${raw}`;

  return (
    <svg className={`logo-mark ${className}`} viewBox="0 0 90 120" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gold} x1="12" y1="8" x2="82" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F6E7B0" />
          <stop offset="0.28" stopColor="#E4C76A" />
          <stop offset="0.52" stopColor="#D4AF37" />
          <stop offset="0.78" stopColor="#B8943A" />
          <stop offset="1" stopColor="#6F4E1D" />
        </linearGradient>
        <linearGradient id={bevel} x1="12" y1="8" x2="40" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF6D0" stopOpacity="0.72" />
          <stop offset="0.5" stopColor="#FFF6D0" stopOpacity="0" />
        </linearGradient>
        <pattern id={brush} width="3" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#6F4E1D" strokeWidth="0.45" opacity="0.28" />
        </pattern>
        <filter id={shadow} x="-25%" y="-15%" width="160%" height="160%">
          <feDropShadow dx="1.5" dy="4" stdDeviation="2.8" floodColor="#000" floodOpacity="0.38" />
        </filter>
      </defs>
      <path
        filter={`url(#${shadow})`}
        fill={`url(#${gold})`}
        d="M12 10h70L64 34H28v12h48L58 70H28v12h40L50 110H12V10z"
      />
      <path fill={`url(#${brush})`} d="M12 10h70L64 34H28v12h48L58 70H28v12h40L50 110H12V10z" />
      <path fill={`url(#${bevel})`} d="M12 10h70L64 34H28v12h48L58 70H28v12h40L50 110H12V10z" />
      <path
        d="M12 10h70L64 34H28M28 46h48L58 70H28M28 82h40L50 110"
        stroke="#FFF6D0"
        strokeOpacity="0.38"
        strokeWidth="1.4"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function LogoMark({ className = "h-10 w-8" }: { className?: string }) {
  return <GoldE className={className} />;
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
      <GoldE className={compact ? "h-9 w-7" : "h-12 w-9"} />
      <span className="leading-none">
        <span
          className={`block font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[0.28em] ${
            light ? "text-[#F5EFE4]" : "gold-text"
          }`}
        >
          ELVARO
        </span>
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
