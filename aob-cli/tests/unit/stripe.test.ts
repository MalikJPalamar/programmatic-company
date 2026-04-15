import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StripeAdapter } from '../../src/adapters/stripe.js';
import { mockStripeCustomer, mockStripeCharges, mockStripeSubs, mockStripeNoSubs } from '../fixtures/mock-responses.js';

describe('StripeAdapter', () => {
  const adapter = new StripeAdapter({ secretKey: 'sk_test_xxx', baseUrl: 'https://mock.stripe' });
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => { fetchSpy = vi.spyOn(globalThis, 'fetch'); });
  afterEach(() => { fetchSpy.mockRestore(); });

  function mockFetch(data: unknown) {
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }

  it('gets a customer', async () => {
    mockFetch(mockStripeCustomer);
    const customer = await adapter.getCustomer('cus_stripe001');
    expect(customer.id).toBe('cus_stripe001');
    expect(customer.email).toBe('sarah@example.com');
  });

  it('lists payments with amount conversion from cents', async () => {
    mockFetch(mockStripeCharges);
    const payments = await adapter.listPayments('cus_stripe001');
    expect(payments).toHaveLength(2);
    expect(payments[0].amount).toBe(297); // 29700 cents → 297 dollars
    expect(payments[0].status).toBe('succeeded');
  });

  it('returns current for active subscription', async () => {
    mockFetch(mockStripeSubs);
    const status = await adapter.getPaymentStatus('cus_stripe001');
    expect(status).toBe('current');
  });

  it('returns lifetime for no subs but successful charges', async () => {
    mockFetch(mockStripeNoSubs);
    mockFetch(mockStripeCharges);
    const status = await adapter.getPaymentStatus('cus_stripe001');
    expect(status).toBe('lifetime');
  });

  it('returns none for no subs and no charges', async () => {
    mockFetch(mockStripeNoSubs);
    mockFetch({ data: [] });
    const status = await adapter.getPaymentStatus('cus_none');
    expect(status).toBe('none');
  });
});
