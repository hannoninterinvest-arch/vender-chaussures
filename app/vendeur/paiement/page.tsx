"use client";

import { useCallback, useEffect, useState } from "react";
import { isAdmin, sellerRequest } from "@/lib/seller";
import { useToast } from "@/components/Toast";

type Check = { id: string; label: string; ok: boolean; detail: string };
type Diagnostic = { ready: boolean; checks: Check[] };
type TestPayment = { paymentRef: string; payUrl: string; amountTnd: number };
type TestStatus = { status: string; paid: boolean; failed: boolean; amountTnd: number };

const REF_KEY = "flouci-test-ref";

const STATUS_TEXT: Record<string, string> = {
  PENDING: "En attente : le paiement n’est pas encore terminé.",
  SUCCESS: "Paiement réussi : Flouci fonctionne de bout en bout.",
  EXPIRED: "Session expirée sans paiement.",
  FAILURE: "Paiement refusé par Flouci.",
  SYSTEM_FAILURE: "Erreur côté Flouci.",
};

export default function PaymentTestPage() {
  const toast = useToast();
  const admin = isAdmin();
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [test, setTest] = useState<TestPayment | null>(null);
  const [status, setStatus] = useState<TestStatus | null>(null);
  const [busy, setBusy] = useState("");

  const check = useCallback(
    async (paymentRef: string) => {
      setBusy("check");
      try {
        setStatus(await sellerRequest<TestStatus>(`/admin/payments/test/${encodeURIComponent(paymentRef)}`));
      } catch (err) {
        toast(err instanceof Error ? err.message : "Vérification impossible");
      } finally {
        setBusy("");
      }
    },
    [toast],
  );

  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    sellerRequest<Diagnostic>("/admin/payments/diagnostic")
      .then((data) => {
        if (!cancelled) setDiagnostic(data);
      })
      .catch((err: Error) => {
        if (!cancelled) toast(err.message);
      });
    const saved = sessionStorage.getItem(REF_KEY);
    if (saved) {
      sessionStorage.removeItem(REF_KEY);
      sellerRequest<TestStatus>(`/admin/payments/test/${encodeURIComponent(saved)}`)
        .then((data) => {
          if (!cancelled) setStatus(data);
        })
        .catch((err: Error) => {
          if (!cancelled) toast(err.message);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [admin, toast]);

  if (!admin) return <p className="text-red-600">Réservé à l’administrateur.</p>;

  async function start() {
    setBusy("start");
    setStatus(null);
    try {
      const data = await sellerRequest<TestPayment>("/admin/payments/test", { method: "POST" });
      sessionStorage.setItem(REF_KEY, data.paymentRef);
      setTest(data);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Impossible d’ouvrir un paiement de test");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4 rounded-[4px] border border-[#C5A059]/35 bg-white p-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] uppercase">Configuration Flouci</h1>
        <p className="text-sm text-[#666]">Contrôle sans appel au prestataire. Les clés ne sont jamais affichées.</p>
        {!diagnostic && <p className="text-sm text-[#666]">Analyse…</p>}
        {diagnostic && (
          <>
            <p className={`font-bold ${diagnostic.ready ? "text-green-700" : "text-red-600"}`}>
              {diagnostic.ready ? "Configuration complète" : "Configuration incomplète"}
            </p>
            <ul className="space-y-2">
              {diagnostic.checks.map((item) => (
                <li key={item.id} className="rounded border border-[#E5E5E5] p-3 text-sm">
                  <p className="font-medium">
                    <span className={item.ok ? "text-green-700" : "text-red-600"}>{item.ok ? "OK" : "À corriger"}</span> · {item.label}
                  </p>
                  <p className="mt-1 break-all text-[#666]">{item.detail}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="space-y-4 rounded-[4px] border border-[#C5A059]/35 bg-white p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] uppercase">Paiement de test</h2>
        <p className="text-sm text-[#666]">
          Ouvre une vraie session Flouci de 1 TND, sans créer de commande. Elle valide les clés, la redirection de retour et la
          lecture du résultat. Si tu paies, ce montant est réellement débité.
        </p>
        <button
          type="button"
          onClick={() => void start()}
          disabled={busy !== "" || diagnostic?.ready === false}
          className="gold-btn rounded-sm px-5 py-3 text-xs uppercase disabled:opacity-60"
        >
          {busy === "start" ? "Ouverture…" : "Lancer un paiement de test"}
        </button>
        {diagnostic?.ready === false && <p className="text-sm text-red-600">Corrige d’abord la configuration.</p>}

        {test && (
          <div className="space-y-3 rounded border border-[#E5E5E5] p-3 text-sm">
            <p className="text-green-700">La session Flouci s’est ouverte : les clés sont acceptées.</p>
            <a href={test.payUrl} className="gold-btn inline-block rounded-sm px-4 py-2 text-xs uppercase" rel="noopener noreferrer">
              Ouvrir la page de paiement
            </a>
            <button type="button" className="ml-3 underline" disabled={busy !== ""} onClick={() => void check(test.paymentRef)}>
              Vérifier le résultat
            </button>
          </div>
        )}

        {status && (
          <div
            role="status"
            className={`rounded border p-3 text-sm ${status.paid ? "border-green-600 text-green-700" : status.failed ? "border-red-600 text-red-600" : "border-[#C5A059]"}`}
          >
            <p className="font-bold">{STATUS_TEXT[status.status] ?? `Statut Flouci : ${status.status}`}</p>
            <p>Montant : {status.amountTnd.toFixed(3)} TND</p>
          </div>
        )}
      </section>
    </div>
  );
}
