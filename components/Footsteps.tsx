/** Semelle cuir ville — un seul pas, le plus réaliste. */

function ShoePrint({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 108" fill="currentColor" aria-hidden>
      <path d="M21.8 1.6c7.4.2 14 5.6 15.2 13.2 1.2 7.4-.8 13.4-3.2 20.6-1.8 5.8-2.6 11.8-2 18.8.4 4.8 1.6 8.6 3.8 12.4 2 3.4 3.2 6.6 3.2 10.4 0 8.6-7.6 15.6-17 15.6S4.8 85.6 4.8 77c0-3.8 1.2-7 3.2-10.4 2.2-3.8 3.4-7.6 3.8-12.4.6-7-.2-13-2-18.8-2.4-7.2-4.4-13.2-3.2-20.6C7.8 7.2 14.4 1.8 21.8 1.6z" />
      <ellipse cx="22.2" cy="24.5" rx="8.8" ry="11.6" fill="var(--gold-light)" opacity="0.32" />
      <ellipse cx="21.6" cy="73.8" rx="8.4" ry="7.8" fill="var(--gold-dark)" opacity="0.46" />
      <ellipse
        cx="21.6"
        cy="73.8"
        rx="4.8"
        ry="4.4"
        fill="none"
        stroke="var(--gold-light)"
        strokeWidth="0.9"
        opacity="0.55"
      />
      <path
        d="M13.6 40.5c2 7.4 2.6 14 2.4 21M30.2 40.5c-1.6 7.2-2 13.8-1.6 20.8M16.6 36.8c4.2.9 8.2.9 12.4 0"
        fill="none"
        stroke="var(--gold-dark)"
        strokeWidth="1.05"
        strokeLinecap="round"
        opacity="0.42"
      />
    </svg>
  );
}

export function Footstep({
  className = "",
  size = "md",
  animated = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}) {
  return (
    <span
      className={`footstep-mark footstep-${size}${animated ? " is-animated" : ""} ${className}`}
      aria-hidden
    >
      <span className="footstep-3d">
        <span className="footstep-shadow" />
        <ShoePrint className="footstep-sole" />
      </span>
    </span>
  );
}

/** Un seul pas — le composant historique gardait une file de quatre empreintes. */
export function Footsteps({
  className = "",
  size = "md",
  animated = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}) {
  return <Footstep className={className} size={size} animated={animated} />;
}
