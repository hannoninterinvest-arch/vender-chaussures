import type { CSSProperties } from "react";

function ShoePrint({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 88" fill="currentColor" aria-hidden>
      <path d="M19.6 1.6c6.4.1 12 4.8 13.2 11.6 1.1 6.4-.6 11.6-2.6 17.8-1.7 5.2-2.4 10.4-2 16.6.3 4.4 1.2 7.8 3.2 11.2 1.7 2.8 2.8 5.4 2.8 8.6 0 6.6-6.4 12.2-14.8 12.2S4.6 73.8 4.6 67.2c0-3.2 1.1-5.8 2.8-8.6 2-3.4 2.9-6.8 3.2-11.2.4-6.2-.3-11.4-2-16.6-2-6.2-3.7-11.4-2.6-17.8C7.2 6.4 13 1.7 19.6 1.6z" />
      <ellipse cx="20" cy="21" rx="8.2" ry="10" fill="var(--gold-light)" opacity="0.28" />
      <ellipse cx="19.2" cy="64.5" rx="7.2" ry="6.4" fill="var(--gold-dark)" opacity="0.38" />
      <path
        d="M13.2 36c1.8 6.4 2.4 12.2 2.2 18.4M26.4 36c-1.4 6.2-1.8 12-1.5 18.2"
        fill="none"
        stroke="var(--gold-dark)"
        strokeWidth="1.1"
        opacity="0.35"
      />
    </svg>
  );
}

/** Deux pas 3D qui marchent — version compacte (titre, pied de page). */
export function Footsteps({ className = "" }: { className?: string }) {
  return (
    <span className={`footsteps ${className}`} aria-hidden>
      <span className="footstep-3d">
        <ShoePrint className="footstep footstep-l" />
      </span>
      <span className="footstep-3d">
        <ShoePrint className="footstep footstep-r" />
      </span>
    </span>
  );
}

const TRACE = [0, 1, 2, 3, 4, 5, 6] as const;

/** Deux traces de pas en perspective, qui avancent vers l’avant. */
export function WalkingTrail({ className = "" }: { className?: string }) {
  return (
    <div className={`walk-banner ${className}`} aria-hidden>
      <div className="walk-mist" />
      <div className="walk-stage">
        <div className="walk-plane">
          <div className="walk-path" />
          <div className="walk-trail walk-trail-l">
            {TRACE.map((i) => (
              <span key={`l-${i}`} className="walk-slot" style={{ "--i": i } as CSSProperties}>
                <span className="walk-print">
                  <ShoePrint className="walk-sole walk-sole-l" />
                </span>
              </span>
            ))}
          </div>
          <div className="walk-trail walk-trail-r">
            {TRACE.map((i) => (
              <span key={`r-${i}`} className="walk-slot" style={{ "--i": i } as CSSProperties}>
                <span className="walk-print walk-print-r">
                  <ShoePrint className="walk-sole walk-sole-r" />
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
