import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type FlouciGenerate = {
  result?: {
    success?: boolean;
    payment_id?: string;
    link?: string;
    developer_tracking_id?: string;
    message?: string;
    status?: number;
  };
  message?: string;
};

type FlouciVerify = {
  success?: boolean;
  result?: {
    status?: string;
    amount?: number;
    type?: string;
    developer_tracking_id?: string | null;
    details?: { order_number?: string };
  };
};

export type OnlinePayment = {
  status?: string;
  orderId?: string;
};

@Injectable()
export class FlouciService {
  private readonly log = new Logger(FlouciService.name);

  constructor(private readonly config: ConfigService) {}

  configured() {
    return Boolean(this.publicKey() && this.privateKey());
  }

  async initPayment(input: {
    orderId: string;
    amountTnd: number;
    customerName: string;
    phone: string;
  }) {
    if (!this.configured()) {
      throw new BadRequestException(
        'Paiement Flouci non configuré. Ajoute FLOUCI_PUBLIC_KEY et FLOUCI_PRIVATE_KEY dans backend/.env',
      );
    }

    const millimes = Math.round(Number(input.amountTnd) * 1000);
    if (!Number.isFinite(millimes) || millimes < 100) {
      throw new BadRequestException('Montant de paiement invalide');
    }

    const frontend = this.frontendUrl();
    const webhook = `${this.backendUrl()}/api/payments/flouci/webhook`;
    const body = {
      amount: millimes,
      developer_tracking_id: input.orderId,
      accept_card: true,
      session_timeout_secs: 1800,
      success_link: `${frontend}/commande/${input.orderId}?paid=1`,
      fail_link: `${frontend}/commande/${input.orderId}?paid=0`,
      webhook,
    };

    const res = await fetch(`${this.baseUrl()}/generate_payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader(),
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as FlouciGenerate;
    const result = data.result;
    if (!res.ok || !result?.success || !result.link || !result.payment_id) {
      this.log.warn(`Flouci init failed ${res.status}: ${JSON.stringify(data)}`);
      throw new BadRequestException(
        result?.message ||
          data.message ||
          'Impossible d’ouvrir le paiement Flouci. Réessaie ou choisis le paiement à la livraison.',
      );
    }

    return { payUrl: result.link, paymentRef: result.payment_id };
  }

  async getPayment(paymentRef: string): Promise<OnlinePayment | null> {
    if (!this.configured() || !paymentRef) return null;
    const res = await fetch(
      `${this.baseUrl()}/verify_payment/${encodeURIComponent(paymentRef)}`,
      { headers: { Authorization: this.authHeader() } },
    );
    if (!res.ok) {
      this.log.warn(`Flouci verify ${paymentRef} → ${res.status}`);
      return null;
    }
    const data = (await res.json().catch(() => ({}))) as FlouciVerify;
    if (data.success === false) return { status: 'FAILURE' };
    const status = (data.result?.status || '').toUpperCase();
    return {
      status,
      orderId: data.result?.developer_tracking_id || undefined,
    };
  }

  isPaid(payment: OnlinePayment | null) {
    return (payment?.status || '').toUpperCase() === 'SUCCESS';
  }

  isFailed(payment: OnlinePayment | null) {
    const status = (payment?.status || '').toUpperCase();
    return ['EXPIRED', 'FAILURE', 'SYSTEM_FAILURE', 'FAILED', 'CANCELED', 'CANCELLED'].includes(
      status,
    );
  }

  frontendUrl() {
    const raw = this.config.get<string>('FRONTEND_URL') ?? '*';
    const first = raw
      .split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .find((s) => s && s !== '*');
    return first || 'http://localhost:3000';
  }

  backendUrl() {
    const explicit = (
      this.config.get<string>('BACKEND_PUBLIC_URL') ||
      this.config.get<string>('RENDER_EXTERNAL_URL') ||
      ''
    ).trim();
    if (explicit) return explicit.replace(/\/$/, '');
    return 'http://localhost:3001';
  }

  private publicKey() {
    return (
      this.config.get<string>('FLOUCI_PUBLIC_KEY') ??
      this.config.get<string>('FLOUCI_APP_TOKEN') ??
      ''
    ).trim();
  }

  private privateKey() {
    return (
      this.config.get<string>('FLOUCI_PRIVATE_KEY') ??
      this.config.get<string>('FLOUCI_APP_SECRET') ??
      ''
    ).trim();
  }

  private authHeader() {
    return `Bearer ${this.publicKey()}:${this.privateKey()}`;
  }

  private baseUrl() {
    const custom = (this.config.get<string>('FLOUCI_API_URL') ?? '').trim();
    if (custom) return custom.replace(/\/$/, '');
    return 'https://developers.flouci.com/api/v2';
  }
}
