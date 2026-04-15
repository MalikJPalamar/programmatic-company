import { describe, it, expect, vi } from 'vitest';
import { StudentFusionService } from '../../src/services/student-fusion.js';
import type { CRMAdapter, PaymentAdapter, CommunityAdapter, UnifiedContact, PaginatedResult } from '../../src/types.js';

function createMockCRM(): CRMAdapter {
  const contact: UnifiedContact = {
    id: '1001', firstName: 'Sarah', lastName: 'Chen', email: 'sarah@example.com',
    tags: ['program:TT2', 'student'], source: 'website', createdAt: '2024-01-01',
    customFields: { stripeCustomerId: 'cus_001' },
  };
  return {
    listContacts: vi.fn().mockResolvedValue({ items: [contact], total: 1, page: 1, pageSize: 20, hasMore: false } as PaginatedResult<UnifiedContact>),
    getContact: vi.fn().mockResolvedValue(contact),
    searchContacts: vi.fn().mockResolvedValue([contact]),
    createContact: vi.fn().mockResolvedValue(contact),
    updateContact: vi.fn().mockResolvedValue(contact),
  };
}

function createMockPayment(): PaymentAdapter {
  return {
    getCustomer: vi.fn().mockResolvedValue({ id: 'cus_001', email: 'sarah@example.com', name: 'Sarah Chen' }),
    listPayments: vi.fn().mockResolvedValue([]),
    getPaymentStatus: vi.fn().mockResolvedValue('current'),
  };
}

function createMockCommunity(): CommunityAdapter {
  return {
    getMember: vi.fn().mockResolvedValue({ id: 'm001', name: 'Sarah Chen', email: 'sarah@example.com', joinedAt: '2024-01-15', lastActiveAt: '2026-04-14', groups: ['TT2'], active: true }),
    listMembers: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20, hasMore: false }),
    isActive: vi.fn().mockResolvedValue(true),
  };
}

describe('StudentFusionService', () => {
  it('fuses CRM + Stripe + Mighty data into UnifiedStudent', async () => {
    const service = new StudentFusionService(createMockCRM(), createMockPayment(), createMockCommunity());
    const student = await service.getStudent('1001');

    expect(student.id).toBe('1001');
    expect(student.firstName).toBe('Sarah');
    expect(student.programs).toContain('TT2');
    expect(student.paymentStatus).toBe('current');
    expect(student.communityActive).toBe(true);
    expect(student.lastActivityAt).toBe('2026-04-14');
    expect(student.mightyMemberId).toBe('m001');
  });

  it('handles missing payment data gracefully', async () => {
    const payment = createMockPayment();
    payment.getPaymentStatus = vi.fn().mockRejectedValue(new Error('Stripe down'));

    const service = new StudentFusionService(createMockCRM(), payment, createMockCommunity());
    const student = await service.getStudent('1001');

    expect(student.paymentStatus).toBe('none'); // Graceful fallback
  });

  it('handles missing community data gracefully', async () => {
    const community = createMockCommunity();
    community.getMember = vi.fn().mockResolvedValue(null);

    const service = new StudentFusionService(createMockCRM(), createMockPayment(), community);
    const student = await service.getStudent('1001');

    expect(student.communityActive).toBe(false);
    expect(student.mightyMemberId).toBeUndefined();
  });

  it('lists students with fusion', async () => {
    const service = new StudentFusionService(createMockCRM(), createMockPayment(), createMockCommunity());
    const result = await service.listStudents();

    expect(result.items).toHaveLength(1);
    expect(result.items[0].paymentStatus).toBe('current');
  });

  it('searches students with fusion', async () => {
    const service = new StudentFusionService(createMockCRM(), createMockPayment(), createMockCommunity());
    const results = await service.searchStudents('Sarah');

    expect(results).toHaveLength(1);
    expect(results[0].firstName).toBe('Sarah');
    expect(results[0].communityActive).toBe(true);
  });
});
