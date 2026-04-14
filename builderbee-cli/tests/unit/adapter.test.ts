import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GHLAdapter } from '../../src/adapters/ghl.js';
import {
  mockClients,
  mockClient,
  mockContacts,
  mockSearchResults,
  mockWorkflows,
  mockSnapshots,
} from '../fixtures/ghl-responses.js';

describe('GHLAdapter', () => {
  const adapter = new GHLAdapter({
    apiKey: 'test-api-key',
    locationId: 'loc_001',
    baseUrl: 'https://mock.ghl.api',
  });

  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  function mockFetch(data: unknown, status = 200) {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }

  describe('listClients', () => {
    it('returns paginated clients', async () => {
      mockFetch(mockClients);

      const result = await adapter.listClients({ limit: 20 });
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('Acme Corp');
      expect(result.total).toBe(3);
    });

    it('filters by status', async () => {
      mockFetch(mockClients);

      const result = await adapter.listClients({ status: 'inactive' });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Gamma LLC');
    });
  });

  describe('getClient', () => {
    it('returns a single client', async () => {
      mockFetch(mockClient);

      const client = await adapter.getClient('loc_001');
      expect(client.id).toBe('loc_001');
      expect(client.name).toBe('Acme Corp');
      expect(client.email).toBe('admin@acme.com');
    });

    it('throws on API error', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('Not Found', { status: 404 })
      );

      await expect(adapter.getClient('nonexistent')).rejects.toThrow('GHL API error (404)');
    });
  });

  describe('listContacts', () => {
    it('returns contacts for a location', async () => {
      mockFetch(mockContacts);

      const result = await adapter.listContacts('loc_001');
      expect(result.items).toHaveLength(2);
      expect(result.items[0].firstName).toBe('John');
      expect(result.items[0].tags).toContain('lead');
    });
  });

  describe('searchContacts', () => {
    it('searches contacts by query', async () => {
      mockFetch(mockSearchResults);

      const results = await adapter.searchContacts('loc_001', 'John');
      expect(results).toHaveLength(1);
      expect(results[0].firstName).toBe('John');
    });
  });

  describe('listWorkflows', () => {
    it('returns workflows for a location', async () => {
      mockFetch(mockWorkflows);

      const workflows = await adapter.listWorkflows('loc_001');
      expect(workflows).toHaveLength(3);
      expect(workflows[0].name).toBe('New Lead Nurture');
      expect(workflows[0].status).toBe('active');
    });
  });

  describe('triggerWorkflow', () => {
    it('triggers workflow successfully', async () => {
      mockFetch({});

      const result = await adapter.triggerWorkflow('wf_001', 'con_001');
      expect(result.success).toBe(true);
    });
  });

  describe('listSnapshots', () => {
    it('returns available snapshots', async () => {
      mockFetch(mockSnapshots);

      const snapshots = await adapter.listSnapshots();
      expect(snapshots).toHaveLength(2);
      expect(snapshots[0].name).toBe('Agency Starter Pack');
    });
  });

  describe('getHealthScore', () => {
    it('calculates health score from client data', async () => {
      // getClient
      mockFetch(mockClient);
      // listContacts (for count)
      mockFetch(mockContacts);
      // listWorkflows
      mockFetch(mockWorkflows);

      const health = await adapter.getHealthScore('loc_001');
      expect(health.clientId).toBe('loc_001');
      expect(health.clientName).toBe('Acme Corp');
      expect(typeof health.score).toBe('number');
      expect(health.score).toBeGreaterThan(0);
      expect(health.factors.activeContacts).toBe(2);
      expect(health.factors.activeWorkflows).toBe(2);
    });
  });
});
