type Props = { className?: string; compact?: boolean };

export default function Logo({ className = "", compact }: Props) {
  return (
    <span
      className={`logo-crop ${
        compact ? "h-[38px] sm:h-[42px]" : "h-[44px] sm:h-[52px]"
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="ELVARO by AIR GO SHOES" />
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
      ? "h-[76px] sm:h-[96px]"
      : size === "sm"
        ? "h-[40px] sm:h-[46px]"
        : "h-[54px] sm:h-[64px]";
  return (
    <span className={`logo-crop ${height} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="ELVARO by AIR GO SHOES" />
    </span>
  );
}
