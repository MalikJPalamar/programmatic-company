import type { PaymentAdapter, PaymentRecord } from '../types.js';

export interface StripeConfig {
  secretKey: string;
  baseUrl?: string;
}

export class StripeAdapter implements PaymentAdapter {
  private secretKey: string;
  private baseUrl: string;

  constructor(config: StripeConfig) {
    this.secretKey = config.secretKey;
    this.baseUrl = config.baseUrl ?? 'https://api.stripe.com/v1';
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => 'Unknown error');
      throw new Error(`Stripe API error (${response.status}): ${body}`);
    }

    return response.json() as Promise<T>;
  }

  async getCustomer(id: string): Promise<{ id: string; email: string; name: string }> {
    const data = await this.request<{ id: string; email: string; name: string }>(`/customers/${id}`);
    return { id: data.id, email: data.email ?? '', name: data.name ?? '' };
  }

  async listPayments(customerId: string, options?: { limit?: number }): Promise<PaymentRecord[]> {
    const params = new URLSearchParams({
      customer: customerId,
      limit: String(options?.limit ?? 20),
    });

    const data = await this.request<{ data: unknown[] }>(`/charges?${params.toString()}`);
    return (data.data ?? []).map((charge: any) => this.mapPayment(charge));
  }

  async getPaymentStatus(customerId: string): Promise<'current' | 'overdue' | 'none' | 'lifetime'> {
    const params = new URLSearchParams({
      customer: customerId,
      status: 'active',
    });

    const data = await this.request<{ data: unknown[] }>(`/subscriptions?${params.toString()}`);
    const subs = data.data ?? [];

    if (subs.length === 0) {
      // Check for one-time payments (lifetime access)
      const charges = await this.listPayments(customerId, { limit: 1 });
      if (charges.length > 0 && charges[0].status === 'succeeded') {
        return 'lifetime';
      }
      return 'none';
    }

    const hasOverdue = subs.some((s: any) => s.status === 'past_due');
    return hasOverdue ? 'overdue' : 'current';
  }

  private mapPayment(raw: any): PaymentRecord {
    return {
      id: raw.id,
      customerId: raw.customer,
      amount: raw.amount / 100, // Stripe uses cents
      currency: raw.currency,
      status: this.mapChargeStatus(raw.status),
      description: raw.description,
      createdAt: new Date(raw.created * 1000).toISOString(),
    };
  }

  private mapChargeStatus(status: string): PaymentRecord['status'] {
    switch (status) {
      case 'succeeded': return 'succeeded';
      case 'failed': return 'failed';
      case 'pending': return 'pending';
      default: return 'pending';
    }
  }
}
