export const ORDER_STATUSES = [
  "paiement_en_cours",
  "en_attente",
  "confirmee",
  "en_livraison",
  "livree",
  "retournee",
  "annulee",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const ORDER_LABELS: Record<string, string> = {
  paiement_en_cours: "Paiement en cours",
  en_attente: "À appeler",
  confirmee: "Confirmée",
  en_livraison: "En livraison",
  livree: "Livrée",
  retournee: "Retournée",
  annulee: "Annulée",
};
export type WorkflowOrder = {
  status: string;
  payment: string;
  paymentStatus?: string;
};
export function effectiveStatus(order: WorkflowOrder): string {
  if (
    order.payment !== "cod" &&
    order.paymentStatus === "paid" &&
    ["paiement_en_cours", "en_attente"].includes(order.status)
  )
    return "confirmee";
  return order.status;
}
export function allowedStatuses(order: WorkflowOrder): OrderStatus[] {
  const status = effectiveStatus(order);
  const transitions: Record<string, OrderStatus[]> = {
    paiement_en_cours: ["annulee"],
    en_attente: ["confirmee", "annulee"],
    confirmee: ["en_livraison", "annulee"],
    en_livraison: ["livree", "retournee"],
    livree: ["retournee"],
    retournee: [],
    annulee: [],
  };
  let result = transitions[status] || [];
  if (order.payment !== "cod" && order.paymentStatus !== "paid")
    result = result.filter(
      (x) => !["confirmee", "en_livraison", "livree"].includes(x),
    );
  return result;
}
export function refundRequired(order: WorkflowOrder) {
  return (
    order.paymentStatus === "paid" &&
    ["annulee", "retournee"].includes(order.status)
  );
}
