type Props = { className?: string; compact?: boolean };

export default function Logo({ className = "", compact }: Props) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="ELVARO by AIR GO SHOES"
        width={1145}
        height={785}
        className={`w-auto max-w-none object-contain ${
          compact ? "h-[44px] sm:h-[48px]" : "h-[52px] sm:h-[60px]"
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
      ? "h-[88px] sm:h-[116px]"
      : size === "sm"
        ? "h-[46px] sm:h-[54px]"
        : "h-[62px] sm:h-[76px]";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="ELVARO by AIR GO SHOES"
      width={1145}
      height={785}
      className={`w-auto max-w-none object-contain ${height} ${className}`}
    />
  );
}
