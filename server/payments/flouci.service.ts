import { createHmac, timingSafeEqual } from "node:crypto";
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
        success_link: `${frontend}/commande/${input.orderId}?paid=1#token=${token}`,
        fail_link: `${frontend}/commande/${input.orderId}?paid=0#token=${token}`,
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
