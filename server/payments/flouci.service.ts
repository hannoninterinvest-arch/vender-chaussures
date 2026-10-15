import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import {
  BadRequestException,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@/server/http";
import { ConfigService } from "@/server/config";
import { appUrl } from "./app-url";

type FlouciPayment = {
  status?: string;
  amount?: number;
  developer_tracking_id?: string;
};

export type PaymentCheck = { id: string; label: string; ok: boolean; detail: string };
export type PaymentDiagnostic = { ready: boolean; checks: PaymentCheck[] };

const API = "https://developers.flouci.com/api/v2";
const WEBHOOK_TOLERANCE_SECONDS = 600;

export class FlouciService {
  private readonly log = new Logger(FlouciService.name);

  constructor(private readonly config: ConfigService) {}

  configured() {
    return Boolean(
      this.key("FLOUCI_PUBLIC_KEY") && this.key("FLOUCI_SECRET_KEY"),
    );
  }

  frontendUrl() {
    return appUrl(this.config);
  }

  async initPayment(input: {
    orderId: string;
    accessToken?: string;
    amountTnd: number;
    returnPath?: string;
  }) {
    if (!this.configured())
      throw new BadRequestException("Paiement Flouci indisponible.");
    const amount = Math.round(Number(input.amountTnd) * 1000);
    if (!Number.isSafeInteger(amount) || amount <= 0)
      throw new BadRequestException("Montant invalide");
    const frontend = this.frontendUrl();
    const token = encodeURIComponent(input.accessToken ?? "");
    const data = await this.request("generate_payment", {
      method: "POST",
      body: JSON.stringify({
        amount: String(amount),
        developer_tracking_id: input.orderId,
        accept_card: true,
        session_timeout_secs: 1800,
        success_link: input.returnPath
          ? `${frontend}${input.returnPath}?paid=1`
          : `${frontend}/commande/${input.orderId}?paid=1#token=${token}`,
        fail_link: input.returnPath
          ? `${frontend}${input.returnPath}?paid=0`
          : `${frontend}/commande/${input.orderId}?paid=0#token=${token}`,
        webhook: `${frontend}/api/payments/flouci/webhook`,
        webhook_version: 1,
      }),
    });
    const result = data?.result;
    if (
      result?.success !== true ||
      typeof result.payment_id !== "string" ||
      typeof result.link !== "string"
    ) {
      this.log.warn("generate_payment: réponse inattendue du prestataire");
      throw new ServiceUnavailableException(
        "Impossible d’ouvrir le paiement Flouci. Réessaie plus tard.",
      );
    }
    let url: URL;
    try {
      url = new URL(result.link);
    } catch {
      url = new URL("http://invalid.invalid");
    }
    if (
      url.protocol !== "https:" ||
      !(url.hostname === "flouci.com" || url.hostname.endsWith(".flouci.com"))
    ) {
      this.log.warn("generate_payment: lien de paiement hors domaine flouci.com");
      throw new ServiceUnavailableException(
        "Lien de paiement Flouci invalide.",
      );
    }
    return { paymentRef: result.payment_id, payUrl: result.link };
  }

  async getPayment(paymentRef: string): Promise<FlouciPayment | null> {
    if (!this.configured() || !paymentRef) return null;
    const data = await this.request(
      `verify_payment/${encodeURIComponent(paymentRef)}`,
      { method: "GET" },
    );
    return data?.success === true ? (data.result ?? null) : null;
  }

  isPaid(payment: FlouciPayment | null, orderId: string, amountTnd: number) {
    return (
      payment?.status === "SUCCESS" &&
      payment.developer_tracking_id === orderId &&
      Number(payment.amount) === Math.round(Number(amountTnd) * 1000)
    );
  }

  isFailed(payment: FlouciPayment | null) {
    return ["EXPIRED", "FAILURE", "SYSTEM_FAILURE"].includes(
      payment?.status ?? "",
    );
  }

  // Flouci signs every webhook with HMAC-SHA256(private key, `${t}.${payload}`).
  // For webhook_version 1 the payload is `payment_id=<id>&success=<True|False>`.
  verifyWebhook(
    params: { paymentId: string; success: string },
    header: string | null,
    now = Date.now(),
  ) {
    const secret = this.key("FLOUCI_SECRET_KEY");
    if (!secret) throw new BadRequestException("Paiement Flouci indisponible.");
    const parts = new Map(
      (header ?? "")
        .split(",")
        .map((part) => part.trim().split("=", 2) as [string, string]),
    );
    const timestamp = parts.get("t") ?? "";
    const received = parts.get("v1") ?? "";
    const invalid = new UnauthorizedException("Signature Flouci invalide");
    if (!/^\d{1,12}$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(received))
      throw invalid;
    if (Math.abs(now / 1000 - Number(timestamp)) > WEBHOOK_TOLERANCE_SECONDS)
      throw invalid;
    const expected = createHmac("sha256", secret)
      .update(
        `${timestamp}.payment_id=${params.paymentId}&success=${params.success}`,
      )
      .digest();
    if (!timingSafeEqual(expected, Buffer.from(received, "hex"))) throw invalid;
  }

  // Read-only configuration audit for the admin. Never returns key values.
  diagnose(now = Date.now()): PaymentDiagnostic {
    const checks: PaymentCheck[] = [];
    const add = (id: string, label: string, ok: boolean, detail: string) =>
      checks.push({ id, label, ok, detail });
    const publicKey = this.key("FLOUCI_PUBLIC_KEY");
    const secretKey = this.key("FLOUCI_SECRET_KEY");
    add(
      "public_key",
      "Clé publique Flouci",
      Boolean(publicKey),
      publicKey ? "FLOUCI_PUBLIC_KEY est définie." : "FLOUCI_PUBLIC_KEY est absente : la définir dans Vercel puis redéployer.",
    );
    add(
      "secret_key",
      "Clé privée Flouci",
      Boolean(secretKey),
      secretKey ? "FLOUCI_SECRET_KEY est définie." : "FLOUCI_SECRET_KEY est absente : la définir dans Vercel puis redéployer.",
    );
    let frontend = "";
    try {
      frontend = this.frontendUrl();
      const https = frontend.startsWith("https://");
      add(
        "app_url",
        "Adresse publique du site (APP_URL)",
        https,
        https
          ? `Les retours de paiement pointent vers ${frontend}.`
          : `APP_URL vaut ${frontend} : Flouci ne peut pas rappeler une adresse non HTTPS, la définir en HTTPS.`,
      );
    } catch (error) {
      add("app_url", "Adresse publique du site (APP_URL)", false, error instanceof Error ? error.message : "APP_URL invalide.");
    }
    if (frontend) {
      add("webhook", "Adresse du webhook", frontend.startsWith("https://"), `${frontend}/api/payments/flouci/webhook`);
    }
    if (secretKey) {
      const t = String(Math.floor(now / 1000));
      const header = `t=${t},v1=${createHmac("sha256", secretKey)
        .update(`${t}.payment_id=test&success=True`)
        .digest("hex")}`;
      let accepted = false;
      let rejected = false;
      try {
        this.verifyWebhook({ paymentId: "test", success: "True" }, header, now);
        accepted = true;
      } catch {
        accepted = false;
      }
      try {
        this.verifyWebhook({ paymentId: "test", success: "False" }, header, now);
      } catch (error) {
        rejected = error instanceof UnauthorizedException;
      }
      const signatureOk = accepted && rejected;
      add(
        "signature",
        "Vérification de signature du webhook",
        signatureOk,
        signatureOk
          ? "Une signature valide est acceptée et une signature falsifiée est refusée."
          : "La vérification de signature ne se comporte pas comme prévu.",
      );
    }
    return { ready: checks.every((check) => check.ok), checks };
  }

  // Opens a real 1 TND Flouci session that is not tied to any order, so the
  // admin can validate keys, redirects and the provider end to end.
  async createTestPayment() {
    const { paymentRef, payUrl } = await this.initPayment({
      orderId: `test-${randomUUID()}`,
      amountTnd: 1,
      returnPath: "/vendeur/paiement",
    });
    return { paymentRef, payUrl, amountTnd: 1 };
  }

  async checkTestPayment(paymentRef: string) {
    if (!this.configured()) throw new BadRequestException("Paiement Flouci indisponible.");
    if (!/^[A-Za-z0-9_-]{3,100}$/.test(paymentRef)) throw new BadRequestException("Référence de paiement invalide");
    const payment = await this.getPayment(paymentRef);
    if (!payment) throw new BadRequestException("Paiement introuvable chez Flouci.");
    if (!String(payment.developer_tracking_id ?? "").startsWith("test-")) {
      throw new BadRequestException("Ce paiement n’est pas un paiement de test.");
    }
    return {
      paymentRef,
      status: String(payment.status ?? "UNKNOWN"),
      paid: payment.status === "SUCCESS",
      failed: this.isFailed(payment),
      amountTnd: Number(payment.amount) / 1000,
    };
  }

  private key(name: string) {
    return (this.config.get<string>(name) ?? "").trim();
  }

  private async request(path: string, init: RequestInit) {
    const operation = path.split("/")[0];
    let res: Response;
    try {
      res = await fetch(`${API}/${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.key("FLOUCI_PUBLIC_KEY")}:${this.key("FLOUCI_SECRET_KEY")}`,
        },
        signal: AbortSignal.timeout(15000),
      });
    } catch (error) {
      const timeout = error instanceof Error && error.name === "TimeoutError";
      this.log.warn(`${operation}: ${timeout ? "délai dépassé" : "réseau indisponible"}`);
      throw this.unavailable();
    }
    const body = await res.json().catch(() => undefined);
    if (!res.ok) {
      const message = body?.result?.message ?? body?.message;
      this.log.warn(
        `${operation}: HTTP ${res.status}${typeof message === "string" ? ` (${message.slice(0, 120)})` : ""}${
          res.status === 401 || res.status === 403
            ? " — vérifier FLOUCI_PUBLIC_KEY / FLOUCI_SECRET_KEY (test ou production)"
            : ""
        }`,
      );
      throw this.unavailable();
    }
    if (body === undefined) {
      this.log.warn(`${operation}: réponse non JSON`);
      throw this.unavailable();
    }
    return body;
  }

  private unavailable() {
    return new ServiceUnavailableException(
      "Flouci est temporairement indisponible. Réessaie plus tard.",
    );
  }
}
