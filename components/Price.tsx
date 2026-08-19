import { formatTnd } from "@/lib/format";

type Priced = { price: number; oldPrice?: number | null; discount?: number };

export function hasPromo(product: Priced) {
  return Boolean(product.oldPrice && product.oldPrice > product.price);
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
  const promo = hasPromo(product);
  const main =
    size === "lg" ? "text-2xl font-semibold" : size === "sm" ? "text-sm font-semibold" : "text-base font-semibold";
  const old = size === "lg" ? "text-base" : "text-xs";

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className={`${main} ${promo ? "text-[var(--promo)]" : "text-[var(--gold)]"}`}>
        {formatTnd(product.price)}
      </span>
      {promo && product.oldPrice ? (
        <span className={`${old} text-[var(--muted)] line-through decoration-[1.5px]`}>
          {formatTnd(product.oldPrice)}
        </span>
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
