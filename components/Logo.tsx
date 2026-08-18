export function Logo({ className = "h-[72px] w-auto" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="ELVARO" className={`object-contain ${className}`} />
  );
}

export function BrandLockup({
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  return <Logo className={compact ? "h-14 w-auto" : "h-[72px] w-auto"} />;
}
