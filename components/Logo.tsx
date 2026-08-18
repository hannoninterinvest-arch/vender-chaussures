const LOGO = "/brand/elvaro-logo.png";

type ImgProps = {
  className?: string;
  alt?: string;
};

export function LogoMark({ className = "h-12 w-auto", alt = "" }: ImgProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO} alt={alt} className={`logo-direct bg-black object-contain ${className}`} />
  );
}

export function ElvaroWordmark({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO} alt="ELVARO" className={`logo-direct bg-black object-contain ${className}`} />
  );
}

export function OfficialLockup({
  className = "h-40 w-auto",
}: {
  className?: string;
  variant?: "gold" | "white" | "flat" | "svg";
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO} alt="ELVARO" className={`logo-direct bg-black object-contain ${className}`} />
  );
}

export function BrandLockup({
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  return (
    <span className="flex items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO}
        alt="ELVARO"
        className={`logo-direct bg-black object-contain ${compact ? "h-12 w-auto" : "h-[72px] w-auto"}`}
      />
    </span>
  );
}
