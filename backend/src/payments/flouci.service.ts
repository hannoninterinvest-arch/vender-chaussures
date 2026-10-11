import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KonnectService } from './konnect.service';

type FlouciPayment = { status?: string; amount?: number; developer_tracking_id?: string };

@Injectable()
export class FlouciService {
  constructor(private readonly config: ConfigService, private readonly konnect: KonnectService) {}

  configured() {
    return Boolean(this.key('FLOUCI_PUBLIC_KEY') && this.key('FLOUCI_SECRET_KEY'));
  }

  async initPayment(input: { orderId: string; amountTnd: number }) {
    if (!this.configured()) throw new BadRequestException('Paiement Flouci indisponible.');
    const amount = Math.round(Number(input.amountTnd) * 1000);
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new BadRequestException('Montant invalide');
    const frontend = this.konnect.frontendUrl();
    const data = await this.request('generate_payment', {
      method: 'POST',
      body: JSON.stringify({
        amount: String(amount),
        developer_tracking_id: input.orderId,
        accept_card: true,
        session_timeout_secs: 1800,
        success_link: `${frontend}/commande/${input.orderId}?paid=1`,
        fail_link: `${frontend}/commande/${input.orderId}?paid=0`,
        webhook: `${this.konnect.backendUrl()}/api/payments/flouci/webhook`,
        webhook_version: 1,
      }),
    });
    const result = data?.result;
    if (result?.success !== true || typeof result.payment_id !== 'string' || typeof result.link !== 'string') {
      throw new ServiceUnavailableException('Impossible d’ouvrir le paiement Flouci. Réessaie plus tard.');
    }
    const url = new URL(result.link);
    if (url.protocol !== 'https:' || !(url.hostname === 'flouci.com' || url.hostname.endsWith('.flouci.com'))) {
      throw new ServiceUnavailableException('Lien de paiement Flouci invalide.');
    }
    return { paymentRef: result.payment_id, payUrl: result.link };
  }

  async getPayment(paymentRef: string): Promise<FlouciPayment | null> {
    if (!this.configured() || !paymentRef) return null;
    const data = await this.request(`verify_payment/${encodeURIComponent(paymentRef)}`, { method: 'GET' });
    return data?.success === true ? data.result ?? null : null;
  }

  isPaid(payment: FlouciPayment | null, orderId: string, amountTnd: number) {
    return payment?.status === 'SUCCESS' && payment.developer_tracking_id === orderId &&
      Number(payment.amount) === Math.round(Number(amountTnd) * 1000);
  }

  isFailed(payment: FlouciPayment | null) {
    return ['EXPIRED', 'FAILURE', 'SYSTEM_FAILURE'].includes(payment?.status ?? '');
  }

  private key(name: string) { return (this.config.get<string>(name) ?? '').trim(); }

  private async request(path: string, init: RequestInit) {
    try {
      const res = await fetch(`https://developers.flouci.com/api/v2/${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.key('FLOUCI_PUBLIC_KEY')}:${this.key('FLOUCI_SECRET_KEY')}` },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error('Flouci API unavailable');
      return await res.json();
    } catch {
      throw new ServiceUnavailableException('Flouci est temporairement indisponible. Réessaie plus tard.');
    }
  }
}
