type Props = { className?: string; compact?: boolean };

/* public/logo-mark.png is the uploaded logo trimmed to its artwork (1096x700)
   with the white backdrop keyed out, so it sits on both themes. */
export default function Logo({ className = "", compact }: Props) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.png"
        alt="ELVARO by AIR GO SHOES"
        width={1096}
        height={700}
        className={`w-auto max-w-none object-contain ${
          compact ? "h-[40px] sm:h-[44px]" : "h-[46px] sm:h-[54px]"
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
      ? "h-[80px] sm:h-[104px]"
      : size === "sm"
        ? "h-[42px] sm:h-[48px]"
        : "h-[56px] sm:h-[68px]";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt="ELVARO by AIR GO SHOES"
      width={1096}
      height={700}
      className={`w-auto max-w-none object-contain ${height} ${className}`}
    />
  );
}
