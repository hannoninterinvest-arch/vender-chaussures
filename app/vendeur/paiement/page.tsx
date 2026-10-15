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

  const tone = status?.paid ? "ok" : status?.failed ? "bad" : "warn";
  return (
    <div>
      <header className="bo-pagehead">
        <div>
          <p className="bo-eyebrow">Administration</p>
          <h1 className="bo-title">Paiement Flouci</h1>
          <p className="bo-sub">
            Vérifie la configuration, puis ouvre un paiement de test de 1 TND pour valider les clés, le retour sur le site et la lecture du
            résultat.
          </p>
        </div>
        {diagnostic && (
          <span className={`bo-badge ${diagnostic.ready ? "bo-badge-ok" : "bo-badge-bad"}`}>
            {diagnostic.ready ? "Configuration complète" : "Configuration incomplète"}
          </span>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="bo-card overflow-hidden">
          <div className="bo-card-pad border-b border-[#e7dfcd]">
            <h2>1 · Configuration</h2>
            <p className="mt-1 text-xs text-[#9a917f]">Contrôle local, sans appel au prestataire. Les clés ne sont jamais affichées.</p>
          </div>
          {!diagnostic && <p className="bo-card-pad text-sm text-[#6f675a]">Analyse en cours…</p>}
          {diagnostic?.checks.map((item) => (
            <div key={item.id} className="bo-check">
              <span className={`bo-dot ${item.ok ? "bo-dot-ok" : "bo-dot-bad"}`}>{item.ok ? "✓" : "!"}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-0.5 break-words text-sm text-[#6f675a]">{item.detail}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="bo-card bo-card-pad space-y-4">
          <div>
            <h2>2 · Paiement de test</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#6f675a]">
              Ouvre une vraie session Flouci de 1 TND, sans créer de commande. Si tu paies, ce montant est réellement débité.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void start()}
            disabled={busy !== "" || diagnostic?.ready === false}
            className="bo-btn bo-btn-primary w-full py-3"
          >
            {busy === "start" ? "Ouverture…" : "Lancer un paiement de test"}
          </button>
          {diagnostic?.ready === false && <p className="text-sm text-[#b3261e]">Corrige d’abord la configuration.</p>}

          {test && (
            <div className="space-y-3 rounded-xl border border-[#e7dfcd] bg-[#fffaf0] p-4 text-sm">
              <p className="font-semibold text-[#1f7a4d]">Session ouverte : les clés sont acceptées par Flouci.</p>
              <div className="flex flex-wrap gap-2">
                <a href={test.payUrl} className="bo-btn bo-btn-primary" rel="noopener noreferrer">
                  Ouvrir la page de paiement
                </a>
                <button type="button" className="bo-btn" disabled={busy !== ""} onClick={() => void check(test.paymentRef)}>
                  Vérifier le résultat
                </button>
              </div>
            </div>
          )}

          {status && (
            <div role="status" className={`bo-alert bo-alert-${tone}`}>
              <p className="font-bold">{STATUS_TEXT[status.status] ?? `Statut Flouci : ${status.status}`}</p>
              <p className="mt-1">Montant : {status.amountTnd.toFixed(3)} TND</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
