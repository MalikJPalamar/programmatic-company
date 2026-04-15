import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OntraportAdapter } from '../../src/adapters/ontraport.js';
import { mockOntraportContacts, mockOntraportContact, mockOntraportSearch, mockOntraportCreated } from '../fixtures/mock-responses.js';

describe('OntraportAdapter', () => {
  const adapter = new OntraportAdapter({ apiKey: 'test-key', appId: 'test-app', baseUrl: 'https://mock.ontraport' });
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => { fetchSpy = vi.spyOn(globalThis, 'fetch'); });
  afterEach(() => { fetchSpy.mockRestore(); });

  function mockFetch(data: unknown) {
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }

  it('lists contacts with unified mapping', async () => {
    mockFetch(mockOntraportContacts);
    const result = await adapter.listContacts({ limit: 20 });
    expect(result.items).toHaveLength(2);
    expect(result.items[0].firstName).toBe('Sarah');
    expect(result.items[0].tags).toContain('program:TT2');
    expect(result.items[0].source).toBe('website');
    expect(result.total).toBe(2);
  });

  it('gets a single contact', async () => {
    mockFetch(mockOntraportContact);
    const contact = await adapter.getContact('1001');
    expect(contact.id).toBe('1001');
    expect(contact.firstName).toBe('Sarah');
    expect(contact.email).toBe('sarah@example.com');
  });

  it('searches contacts', async () => {
    mockFetch(mockOntraportSearch);
    const results = await adapter.searchContacts('Sarah');
    expect(results).toHaveLength(1);
    expect(results[0].firstName).toBe('Sarah');
  });

  it('creates a contact', async () => {
    mockFetch(mockOntraportCreated);
    const contact = await adapter.createContact({ firstName: 'Alex', lastName: 'Kim', email: 'alex@example.com' });
    expect(contact.id).toBe('1003');
    expect(contact.firstName).toBe('Alex');
  });

  it('updates a contact', async () => {
    mockFetch(mockOntraportContact);
    const contact = await adapter.updateContact('1001', { firstName: 'Sarah Updated' });
    expect(contact.id).toBe('1001');
  });

  it('extracts custom fields', async () => {
    mockFetch(mockOntraportContact);
    const contact = await adapter.getContact('1001');
    expect(contact.customFields.f1234).toBe('cus_stripe001');
  });

  it('throws on API error', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));
    await expect(adapter.getContact('bad')).rejects.toThrow('Ontraport API error (401)');
  });
});
