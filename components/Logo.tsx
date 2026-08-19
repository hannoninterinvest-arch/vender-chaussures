type Size = "sm" | "md" | "lg" | "xl";

const ART = {
  sm: "h-[38px] sm:h-[42px]",
  md: "h-[48px] sm:h-[56px]",
  lg: "h-[64px] sm:h-[76px]",
  xl: "h-[92px] sm:h-[116px]",
} as const;

const BYLINE = {
  sm: "text-[7px] tracking-[0.34em]",
  md: "text-[8px] tracking-[0.36em]",
  lg: "text-[10px] tracking-[0.38em]",
  xl: "text-[12px] tracking-[0.4em]",
} as const;

const SLOGAN = {
  sm: "text-[7px] tracking-[0.26em]",
  md: "text-[8px] tracking-[0.28em]",
  lg: "text-[10px] tracking-[0.3em]",
  xl: "text-[12px] tracking-[0.32em]",
} as const;

/** Le blason et le mot ELVARO : l'image telle qu'elle a été fournie. */
function LogoArt({ size }: { size: Size }) {
  return (
    <span className={`logo-art ${ART[size]}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="ELVARO" />
    </span>
  );
}

export default function Logo({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: Size;
}) {
  return (
    <span className={`brand-signature ${className}`}>
      <LogoArt size={size} />
    </span>
  );
}

/**
 * Le bloc de marque de la carte de visite : le logo, « by AIR GO SHOES »,
 * un filet à losange puis la signature « L'excellence à chaque pas ».
 */
export function BrandSignature({
  className = "",
  size = "md",
  slogan = true,
}: {
  className?: string;
  size?: Size;
  slogan?: boolean;
}) {
  return (
    <span className={`brand-signature ${className}`}>
      <LogoArt size={size} />
      <span className={`brand-byline ${BYLINE[size]}`}>
        <span className="brand-byline-by">by</span> AIR GO SHOES
      </span>
      {slogan ? (
        <>
          <span className="brand-rule" aria-hidden />
          <span className={`brand-slogan ${SLOGAN[size]}`}>L&apos;excellence à chaque pas</span>
        </>
      ) : null}
    </span>
  );
}

/** Version d'en-tête : logo et signature courte, sans le filet. */
export function BrandLockup({
  className = "",
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return <BrandSignature className={className} size={compact ? "sm" : "md"} slogan={false} />;
}

export function BrandMark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: Size;
}) {
  return <BrandSignature className={className} size={size} />;
}
