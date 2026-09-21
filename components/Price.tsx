"use client";

import { useLocale } from "@/lib/locale";

type Priced = { price: number; oldPrice?: number | null; discount?: number };

export function hasPromo(product: Priced) {
  return Boolean(product.oldPrice && product.oldPrice > product.price);
}

export function Money({
  amountDt,
  className = "",
  approx = true,
  align = "start",
}: {
  amountDt: number;
  className?: string;
  approx?: boolean;
  align?: "start" | "end";
}) {
  const { display } = useLocale();
  const shown = display(amountDt);
  const showApprox = approx && Boolean(shown.approxDt);
  return (
    <span
      className={`inline-flex ${showApprox ? "flex-col" : "flex-row items-baseline"} ${align === "end" ? "items-end text-right" : "items-start"} ${className}`}
    >
      <span>{shown.primary}</span>
      {showApprox ? (
        <span className="text-[10px] font-normal tracking-normal text-[var(--muted)]">≈ {shown.approxDt}</span>
      ) : null}
    </span>
  );
}

/** Prix affiché : en promo, l'ancien prix reste visible mais barré. */
export function Price({
  product,
  size = "md",
  className = "",
}: {
  product: Priced;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { display } = useLocale();
  const promo = hasPromo(product);
  const current = display(product.price);
  const previous = product.oldPrice ? display(product.oldPrice) : null;
  const main =
    size === "lg" ? "text-2xl font-semibold" : size === "sm" ? "text-sm font-semibold" : "text-base font-semibold";
  const old = size === "lg" ? "text-base" : "text-xs";

  return (
    <span className={`inline-flex flex-col items-start ${className}`}>
      <span className="inline-flex flex-wrap items-baseline gap-2">
        <span className={`${main} ${promo ? "text-[var(--promo)]" : "text-[var(--gold)]"}`}>
          {current.primary}
        </span>
        {promo && previous ? (
          <span className={`${old} text-[var(--muted)] line-through decoration-[1.5px]`}>
            {previous.primary}
          </span>
        ) : null}
      </span>
      {current.approxDt ? (
        <span className="text-[10px] font-normal text-[var(--muted)]">≈ {current.approxDt}</span>
      ) : null}
    </span>
  );
}

export function PromoBadge({
  product,
  className = "",
}: {
  product: Priced;
  className?: string;
}) {
  if (!hasPromo(product)) return null;
  const percent = product.discount || 0;
  return (
    <span className={`promo-badge ${className}`}>
      {percent > 0 ? `-${percent}%` : "Promo"}
    </span>
  );
}
