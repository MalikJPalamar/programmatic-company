import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MightyNetworksAdapter } from '../../src/adapters/mighty.js';
import { mockMightyMembers, mockMightyMember } from '../fixtures/mock-responses.js';

describe('MightyNetworksAdapter', () => {
  const adapter = new MightyNetworksAdapter({ apiKey: 'test-key', communityId: 'comm_001', baseUrl: 'https://mock.mighty' });
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => { fetchSpy = vi.spyOn(globalThis, 'fetch'); });
  afterEach(() => { fetchSpy.mockRestore(); });

  function mockFetch(data: unknown) {
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }

  it('lists members', async () => {
    mockFetch(mockMightyMembers);
    const result = await adapter.listMembers();
    expect(result.items).toHaveLength(2);
    expect(result.items[0].name).toBe('Sarah Chen');
    expect(result.items[0].active).toBe(true);
  });

  it('gets a member by email', async () => {
    mockFetch(mockMightyMember);
    const member = await adapter.getMember('sarah@example.com');
    expect(member).not.toBeNull();
    expect(member!.email).toBe('sarah@example.com');
    expect(member!.groups).toContain('TT2');
  });

  it('returns null for unknown member', async () => {
    mockFetch({ members: [] });
    const member = await adapter.getMember('nobody@example.com');
    expect(member).toBeNull();
  });

  it('checks if member is active', async () => {
    mockFetch(mockMightyMember);
    const active = await adapter.isActive('sarah@example.com');
    expect(active).toBe(true);
  });

  it('returns false for inactive/missing member', async () => {
    mockFetch({ members: [] });
    const active = await adapter.isActive('nobody@example.com');
    expect(active).toBe(false);
  });
});
