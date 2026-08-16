import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type KonnectInitResponse = {
  payUrl?: string;
  paymentRef?: string;
};

type KonnectPayment = {
  id?: string;
  status?: string;
  orderId?: string;
  amount?: number;
  reachedAmount?: number;
  transactions?: { status?: string }[];
};

@Injectable()
export class KonnectService {
  private readonly log = new Logger(KonnectService.name);

  constructor(private readonly config: ConfigService) {}

  configured() {
    return Boolean(this.apiKey() && this.walletId());
  }

  async initPayment(input: {
    orderId: string;
    amountTnd: number;
    customerName: string;
    phone: string;
  }) {
    if (!this.configured()) {
      throw new BadRequestException(
        'Paiement Konnect non configuré. Ajoute KONNECT_API_KEY et KONNECT_WALLET_ID dans .env',
      );
    }

    const millimes = Math.round(Number(input.amountTnd) * 1000);
    if (!Number.isFinite(millimes) || millimes < 100) {
      throw new BadRequestException('Montant de paiement invalide');
    }

    const names = input.customerName.trim().split(/\s+/);
    const firstName = names[0] || 'Client';
    const lastName = names.slice(1).join(' ') || 'ELVARO';
    const frontend = this.frontendUrl();
    const webhook = `${this.backendUrl()}/api/payments/konnect/webhook`;

    const body = {
      receiverWalletId: this.walletId(),
      token: 'TND',
      amount: millimes,
      type: 'immediate',
      description: `Commande ELVARO ${input.orderId}`,
      acceptedPaymentMethods: this.methods(),
      lifespan: 30,
      checkoutForm: false,
      addPaymentFeesToAmount: false,
      firstName,
      lastName,
      phoneNumber: this.tunisianPhone(input.phone),
      orderId: input.orderId,
      webhook,
      silentWebhook: true,
      successUrl: `${frontend}/commande/${input.orderId}?paid=1`,
      failUrl: `${frontend}/commande/${input.orderId}?paid=0`,
      theme: 'dark',
    };

    const res = await fetch(`${this.baseUrl()}/payments/init-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey(),
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as KonnectInitResponse & {
      message?: string | string[];
      errors?: unknown;
    };

    if (!res.ok || !data.payUrl || !data.paymentRef) {
      this.log.warn(`Konnect init failed ${res.status}: ${JSON.stringify(data)}`);
      throw new BadRequestException(
        this.errorMessage(data) ||
          'Impossible d’ouvrir le paiement Konnect. Réessaie ou choisis le paiement à la livraison.',
      );
    }

    return { payUrl: data.payUrl, paymentRef: data.paymentRef };
  }

  async getPayment(paymentRef: string): Promise<KonnectPayment | null> {
    if (!this.configured() || !paymentRef) return null;
    const res = await fetch(`${this.baseUrl()}/payments/${encodeURIComponent(paymentRef)}`, {
      headers: { 'x-api-key': this.apiKey() },
    });
    if (!res.ok) {
      this.log.warn(`Konnect getPayment ${paymentRef} → ${res.status}`);
      return null;
    }
    const data = (await res.json().catch(() => ({}))) as { payment?: KonnectPayment };
    return data.payment ?? null;
  }

  isPaid(payment: KonnectPayment | null) {
    if (!payment) return false;
    if (payment.status === 'completed') return true;
    return (payment.transactions ?? []).some((tx) => tx.status === 'success');
  }

  isFailed(payment: KonnectPayment | null) {
    if (!payment) return false;
    const status = (payment.status || '').toLowerCase();
    return ['expired', 'canceled', 'cancelled', 'failed'].includes(status);
  }

  private apiKey() {
    return (this.config.get<string>('KONNECT_API_KEY') ?? '').trim();
  }

  private walletId() {
    return (this.config.get<string>('KONNECT_WALLET_ID') ?? '').trim();
  }

  private baseUrl() {
    const custom = (this.config.get<string>('KONNECT_API_URL') ?? '').trim();
    if (custom) return custom.replace(/\/$/, '');
    const sandbox = this.config.get<string>('KONNECT_SANDBOX') !== 'false';
    return sandbox
      ? 'https://api.preprod.konnect.network/api/v2'
      : 'https://api.konnect.network/api/v2';
  }

  private methods() {
    const raw = (this.config.get<string>('KONNECT_METHODS') ?? '').trim();
    const list = (raw || 'wallet,bank_card,e-DINAR,flouci')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    return list.length ? list : ['wallet', 'bank_card', 'e-DINAR'];
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

  private tunisianPhone(raw: string) {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('216') && digits.length >= 11) return digits.slice(-8);
    if (digits.length >= 8) return digits.slice(-8);
    return digits;
  }

  private errorMessage(data: { message?: string | string[] }) {
    if (Array.isArray(data.message)) return data.message.join(', ');
    return data.message;
  }
}
