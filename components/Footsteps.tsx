export function Footsteps({ className = "" }: { className?: string }) {
  return (
    <span className={`footsteps ${className}`} aria-hidden>
      <Footprint className="footstep footstep-1" />
      <Footprint className="footstep footstep-2 is-right" />
      <Footprint className="footstep footstep-3" />
      <Footprint className="footstep footstep-4 is-right" />
    </span>
  );
}

function Footprint({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 48" fill="currentColor">
      <ellipse cx="16" cy="11" rx="7.2" ry="9" />
      <path d="M8.5 24c0-4.2 3.2-7.2 7.5-7.2s7.5 3 7.5 7.2c0 6.6-2.2 16.8-7.5 16.8S8.5 30.6 8.5 24z" />
    </svg>
  );
}
