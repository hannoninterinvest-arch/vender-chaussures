function luminance(hex: string) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function ColorDots({
  colors,
  selected,
  onSelect,
  size = "md",
  showLabels = false,
}: {
  colors: { name: string; hex: string }[];
  selected?: string;
  onSelect?: (name: string) => void;
  size?: "sm" | "md";
  showLabels?: boolean;
}) {
  const dim = size === "sm" ? "h-5 w-5" : "h-11 w-11";
  return (
    <div className={`flex flex-wrap ${showLabels ? "gap-3" : "items-center gap-2.5"}`}>
      {colors.map((c) => {
        const active = selected ? selected === c.name : false;
        const light = luminance(c.hex) > 0.62;
        const disc = (
          <span
            className={`color-swatch-disc ${dim} ${active ? "is-active" : ""}`}
            style={{ background: c.hex }}
            title={c.name}
          >
            {active && onSelect ? (
              <svg
                width={size === "sm" ? 10 : 14}
                height={size === "sm" ? 10 : 14}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3.2 8.2 6.4 11.4 12.8 4.6"
                  stroke={light ? "#1A1612" : "#F6E7B0"}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </span>
        );
        if (!onSelect) {
          return (
            <span key={c.name} className="inline-flex">
              {disc}
            </span>
          );
        }
        return (
          <button
            key={c.name}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(c.name);
            }}
            aria-label={c.name}
            aria-pressed={active}
            className={`color-swatch ${active ? "is-active" : ""}`}
          >
            {disc}
            {showLabels ? <span className="color-swatch-name">{c.name}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
