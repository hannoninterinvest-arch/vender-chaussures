type Props = { className?: string; compact?: boolean; light?: boolean };

export default function Logo({ className = "", compact }: Props) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="ELVARO by AIR GO SHOES"
        className={`w-auto max-w-none object-contain object-left ${
          compact ? "h-[76px] sm:h-[84px]" : "h-[88px] sm:h-[100px]"
        }`}
      />
    </span>
  );
}

export function BrandLockup({ className = "", compact }: Props) {
  return <Logo className={className} compact={compact} />;
}

export function BrandMark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const height =
    size === "lg"
      ? "h-[120px] sm:h-[152px]"
      : size === "sm"
        ? "h-[72px] sm:h-[80px]"
        : "h-[96px] sm:h-[112px]";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="ELVARO by AIR GO SHOES"
      className={`w-auto object-contain ${height} ${className}`}
    />
  );
}
