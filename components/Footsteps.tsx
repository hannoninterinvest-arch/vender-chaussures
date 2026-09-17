/** Semelle cuir ville — un seul pas, le plus réaliste. */

function ShoePrint({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 128" fill="currentColor" aria-hidden>
      {/* Silhouette oxford : bout amande, cambrure étroite, talon distinct. */}
      <path d="M24 2.4c8.6.1 16 6.6 16.8 16 1 10.6-1.4 18.8-5.2 28.2-2.8 7-4.4 13.6-4.2 20.8.2 4.8 1.6 8.2 4.2 12.2 2.2 3.4 3.6 6.8 3.6 11.2 0 10.6-7.8 19.2-15.2 19.2S8.8 101.4 8.8 90.8c0-4.4 1.4-7.8 3.6-11.2 2.6-4 4-7.4 4.2-12.2.2-7.2-1.4-13.8-4.2-20.8-3.8-9.4-6.2-17.6-5.2-28.2C8 9 15.4 2.5 24 2.4z" />
      {/* Chair de la semelle, plus claire. */}
      <path
        d="M24 8.2c6.2.1 11.4 4.6 12 11.2.8 8.4-1.2 15-4.4 23-2.6 6.4-4 12.4-3.8 18.8.2 4 1.4 6.8 3.4 9.8 1.6 2.6 2.6 5 2.6 8.2 0 7.4-5.6 13.4-9.8 13.4s-9.8-6-9.8-13.4c0-3.2 1-5.6 2.6-8.2 2-3 3.2-5.8 3.4-9.8.2-6.4-1.2-12.4-3.8-18.8-3.2-8-5.2-14.6-4.4-23 .6-6.6 5.8-11.1 12-11.2z"
        fill="var(--gold-light)"
        opacity="0.28"
      />
      {/* Coussin avant-pied */}
      <ellipse cx="24.2" cy="28" rx="9.4" ry="13.2" fill="var(--gold-light)" opacity="0.34" />
      {/* Talon cuir, pièce séparée */}
      <ellipse cx="24" cy="93.2" rx="9.6" ry="10.2" fill="var(--gold-dark)" opacity="0.48" />
      <ellipse
        cx="24"
        cy="93.2"
        rx="5.6"
        ry="5.8"
        fill="none"
        stroke="var(--gold-light)"
        strokeWidth="0.85"
        opacity="0.55"
      />
      {/* Rainures de flexion + cambrure */}
      <path
        d="M15.4 46c2.2 8.2 2.8 15.4 2.6 23.2M32.6 46c-1.8 8-2.2 15.2-1.8 22.8M17.8 42.5c4.4 1 8.4 1.1 12.6 0"
        fill="none"
        stroke="var(--gold-dark)"
        strokeWidth="1.05"
        strokeLinecap="round"
        opacity="0.42"
      />
      <path
        d="M33.2 62c.4 9 .2 17.4-.6 26"
        fill="none"
        stroke="var(--gold-dark)"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.3"
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
