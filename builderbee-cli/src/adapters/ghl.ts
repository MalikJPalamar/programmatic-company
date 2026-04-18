import type {
  Client,
  Contact,
  Workflow,
  Snapshot,
  HealthScore,
  PaginatedResult,
  GHLConfig,
  NewClient,
  UpdateClient,
  NewContact,
  UpdateContact,
} from '../types.js';
import { withRetry } from '../utils/retry.js';

export class GHLAdapter {
  private apiKey: string;
  private baseUrl: string;
  private locationId?: string;

  constructor(config: GHLConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://services.leadconnectorhq.com';
    this.locationId = config.locationId;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    return withRetry(async () => {
      const url = `${this.baseUrl}${path}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const body = await response.text().catch(() => 'Unknown error');
        throw new Error(`GHL API error (${response.status}): ${body}`);
      }

      return response.json() as Promise<T>;
    });
  }

  // --- Clients (Sub-accounts / Locations) ---

  async listClients(options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResult<Client>> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('skip', String(options.offset));

    const query = params.toString();
    const data = await this.request<{ locations: unknown[]; total: number }>(
      `/locations/search${query ? `?${query}` : ''}`
    );

    const items = (data.locations ?? []).map((loc: any) => this.mapClient(loc));
    const filtered = options?.status
      ? items.filter((c) => c.status === options.status)
      : items;

    return {
      items: filtered,
      total: data.total ?? filtered.length,
      page: Math.floor((options?.offset ?? 0) / (options?.limit ?? 20)) + 1,
      pageSize: options?.limit ?? 20,
      hasMore: (options?.offset ?? 0) + (options?.limit ?? 20) < (data.total ?? 0),
    };
  }

  async getClient(id: string): Promise<Client> {
    const data = await this.request<{ location: unknown }>(`/locations/${id}`);
    return this.mapClient(data.location);
  }

  async createClient(input: NewClient): Promise<Client> {
    const data = await this.request<{ location: unknown }>('/locations', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return this.mapClient(data.location);
  }

  async updateClient(id: string, input: UpdateClient): Promise<Client> {
    const data = await this.request<{ location: unknown }>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return this.mapClient(data.location);
  }

  async deleteClient(id: string): Promise<{ success: boolean }> {
    await this.request(`/locations/${id}`, { method: 'DELETE' });
    return { success: true };
  }

  // --- Contacts ---

  async listContacts(
    locationId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<PaginatedResult<Contact>> {
    const params = new URLSearchParams({ locationId });
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('startAfterIdx', String(options.offset));

    const data = await this.request<{ contacts: unknown[]; total: number }>(
      `/contacts/?${params.toString()}`
    );

    return {
      items: (data.contacts ?? []).map((c: any) => this.mapContact(c)),
      total: data.total ?? 0,
      page: Math.floor((options?.offset ?? 0) / (options?.limit ?? 20)) + 1,
      pageSize: options?.limit ?? 20,
      hasMore: (options?.offset ?? 0) + (options?.limit ?? 20) < (data.total ?? 0),
    };
  }

  async searchContacts(
    locationId: string,
    query: string
  ): Promise<Contact[]> {
    const data = await this.request<{ contacts: unknown[] }>('/contacts/search', {
      method: 'POST',
      body: JSON.stringify({
        locationId,
        query,
      }),
    });

    return (data.contacts ?? []).map((c: any) => this.mapContact(c));
  }

  async createContact(input: NewContact): Promise<Contact> {
    const data = await this.request<{ contact: unknown }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return this.mapContact(data.contact);
  }

  async updateContact(id: string, input: UpdateContact): Promise<Contact> {
    const data = await this.request<{ contact: unknown }>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return this.mapContact(data.contact);
  }

  // --- Workflows ---

  async listWorkflows(locationId: string): Promise<Workflow[]> {
    const data = await this.request<{ workflows: unknown[] }>(
      `/workflows/?locationId=${locationId}`
    );

    return (data.workflows ?? []).map((w: any) => this.mapWorkflow(w));
  }

  async triggerWorkflow(
    workflowId: string,
    contactId: string
  ): Promise<{ success: boolean }> {
    await this.request(`/workflows/${workflowId}/trigger`, {
      method: 'POST',
      body: JSON.stringify({ contactId }),
    });

    return { success: true };
  }

  async pauseWorkflow(
    workflowId: string,
    locationId: string
  ): Promise<{ success: boolean }> {
    await this.request(`/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify({ locationId, status: 'inactive' }),
    });
    return { success: true };
  }

  async getWorkflowStatus(
    workflowId: string,
    locationId: string
  ): Promise<Workflow> {
    const workflows = await this.listWorkflows(locationId);
    const workflow = workflows.find((w) => w.id === workflowId);
    if (!workflow) {
      throw new Error(`Workflow "${workflowId}" not found in location "${locationId}"`);
    }
    return workflow;
  }

  // --- Snapshots ---

  async listSnapshots(): Promise<Snapshot[]> {
    const data = await this.request<{ snapshots: unknown[] }>('/snapshots');
    return (data.snapshots ?? []).map((s: any) => this.mapSnapshot(s));
  }

  async deploySnapshot(
    snapshotId: string,
    locationId: string
  ): Promise<{ success: boolean; snapshotId: string; locationId: string }> {
    await this.request(`/snapshots/${snapshotId}/deploy`, {
      method: 'POST',
      body: JSON.stringify({ locationId }),
    });
    return { success: true, snapshotId, locationId };
  }

  // --- Health ---

  async getHealthScore(clientId: string): Promise<HealthScore> {
    const client = await this.getClient(clientId);
    const contacts = await this.listContacts(clientId, { limit: 1 });
    const workflows = await this.listWorkflows(clientId);

    const activeWorkflows = workflows.filter((w) => w.status === 'active').length;
    const score = this.calculateHealthScore(contacts.total, activeWorkflows);

    return {
      clientId,
      clientName: client.name,
      score,
      factors: {
        activeContacts: contacts.total,
        activeWorkflows,
        recentActivity: contacts.total > 0,
        paymentStatus: 'current',
      },
    };
  }

  private calculateHealthScore(contacts: number, workflows: number): number {
    let score = 0;
    score += Math.min(contacts / 10, 30); // Up to 30 points for contacts
    score += Math.min(workflows * 10, 30); // Up to 30 points for workflows
    score += contacts > 0 ? 20 : 0; // 20 points for any activity
    score += workflows > 0 ? 20 : 0; // 20 points for any automation
    return Math.round(Math.min(score, 100));
  }

  // --- Mappers ---

  private mapClient(raw: any): Client {
    return {
      id: raw.id ?? raw._id,
      name: raw.name ?? '',
      email: raw.email ?? '',
      phone: raw.phone,
      status: raw.status ?? 'active',
      createdAt: raw.createdAt ?? raw.dateAdded ?? '',
      locationId: raw.id ?? raw._id,
    };
  }

  private mapContact(raw: any): Contact {
    return {
      id: raw.id ?? raw._id,
      firstName: raw.firstName ?? raw.first_name ?? '',
      lastName: raw.lastName ?? raw.last_name ?? '',
      email: raw.email,
      phone: raw.phone,
      tags: raw.tags ?? [],
      source: raw.source,
      createdAt: raw.dateAdded ?? raw.createdAt ?? '',
      locationId: raw.locationId ?? '',
    };
  }

  private mapWorkflow(raw: any): Workflow {
    return {
      id: raw.id ?? raw._id,
      name: raw.name ?? '',
      status: raw.status ?? 'draft',
      triggersCount: raw.triggersCount ?? 0,
      locationId: raw.locationId ?? '',
    };
  }

  private mapSnapshot(raw: any): Snapshot {
    return {
      id: raw.id ?? raw._id,
      name: raw.name ?? '',
      type: raw.type ?? 'unknown',
      createdAt: raw.createdAt ?? '',
    };
  }
}
