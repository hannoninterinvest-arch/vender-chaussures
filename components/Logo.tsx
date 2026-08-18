export function Logo({ className = "h-16 w-auto" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="ELVARO" className={className} />
  );
}

export function BrandLockup({
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  return <Logo className={compact ? "h-12 w-auto" : "h-16 w-auto"} />;
}
