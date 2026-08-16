export function ColorDots({
  colors,
  selected,
  onSelect,
  size = "md",
}: {
  colors: { name: string; hex: string }[];
  selected?: string;
  onSelect?: (name: string) => void;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-4 w-4" : "h-10 w-10";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {colors.map((c) => {
        const active = selected ? selected === c.name : false;
        const ring = selected
          ? active
            ? "border-[var(--gold)] scale-105"
            : "border-transparent opacity-80"
          : "border-[var(--line)]";
        const inner = (
          <span
            className={`${dim} rounded-full border-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] ${ring}`}
            style={{ background: c.hex }}
            title={c.name}
          />
        );
        if (!onSelect) {
          return <span key={c.name}>{inner}</span>;
        }
        return (
          <button key={c.name} type="button" onClick={() => onSelect(c.name)} aria-label={c.name}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}
