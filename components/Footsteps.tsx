/** Semelle cuir ville — un seul pas, lisible comme une vraie empreinte. */

function ShoePrint({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 52 140" fill="currentColor" aria-hidden>
      {/* Avant-pied oxford, bout amande. */}
      <path d="M26 3c9.4 0 17.2 7.6 17.8 18.2 0.7 12.2-2.2 21.4-7.2 32.4-3.2 7-5.2 13.2-5.4 19.2-.2 3.6-1.2 5.6-3.6 6.6-2.2.8-5.4.8-7.6 0-2.4-1-3.4-3-3.6-6.6-.2-6-2.2-12.2-5.4-19.2-5-11-7.9-20.2-7.2-32.4C8.8 10.6 16.6 3 26 3z" />
      {/* Cambrure + talon distinct. */}
      <path d="M26 76.2c5.6 0 9.2 3.4 10.4 8.8 1.4 6.2 1.2 12.2 2.8 17.4 2.2 7.2 6.2 12.6 6.2 19.6 0 10.2-8.8 16.6-19.4 16.6S6.6 132.2 6.6 122c0-7 4-12.4 6.2-19.6 1.6-5.2 1.4-11.2 2.8-17.4 1.2-5.4 4.8-8.8 10.4-8.8z" />
      {/* Chair claire de l’avant-pied. */}
      <ellipse cx="26.2" cy="28" rx="11.2" ry="16" fill="var(--gold-light)" opacity="0.38" />
      {/* Pièce talon. */}
      <ellipse cx="26" cy="118" rx="11.4" ry="12.2" fill="var(--gold-dark)" opacity="0.5" />
      <ellipse
        cx="26"
        cy="118"
        rx="6.2"
        ry="6.6"
        fill="none"
        stroke="var(--gold-light)"
        strokeWidth="1.1"
        opacity="0.7"
      />
      {/* Rainures de flexion. */}
      <path
        d="M16.4 48c2.6 8.8 3.2 16.2 3 24.2M35.6 48c-2.2 8.6-2.6 16-2 23.8M19.2 44.2c4.8 1.2 9.2 1.2 13.8 0"
        fill="none"
        stroke="var(--gold-dark)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.48"
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
