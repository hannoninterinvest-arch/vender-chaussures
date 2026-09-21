type Size = "sm" | "md" | "lg" | "xl";

/** Fichier unique de marque : public/logo.webp (600×411, fond transparent). */
const LOGO = {
  src: "/logo.webp",
  width: 600,
  height: 411,
} as const;

const ART = {
  sm: "h-[44px] sm:h-[50px]",
  md: "h-[56px] sm:h-[64px]",
  lg: "h-[80px] sm:h-[96px]",
  xl: "h-[112px] sm:h-[136px]",
} as const;

function LogoArt({ size }: { size: Size }) {
  return (
    <span className={`logo-art ${ART[size]}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO.src} alt="ELVARO" width={LOGO.width} height={LOGO.height} />
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

export function BrandSignature({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: Size;
  slogan?: boolean;
}) {
  return <Logo className={className} size={size} />;
}

export function BrandLockup({
  className = "",
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return <Logo className={className} size={compact ? "sm" : "md"} />;
}

export function BrandMark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: Size;
}) {
  return <Logo className={className} size={size} />;
}
