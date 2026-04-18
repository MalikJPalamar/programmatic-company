import type { CRMAdapter, UnifiedContact, PaginatedResult, NewContact } from '../types.js';
import { withRetry } from '../utils/retry.js';

export interface OntraportConfig {
  apiKey: string;
  appId: string;
  baseUrl?: string;
}

export class OntraportAdapter implements CRMAdapter {
  private apiKey: string;
  private appId: string;
  private baseUrl: string;

  constructor(config: OntraportConfig) {
    this.apiKey = config.apiKey;
    this.appId = config.appId;
    this.baseUrl = config.baseUrl ?? 'https://api.ontraport.com/1';
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    return withRetry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          'Api-Key': this.apiKey,
          'Api-Appid': this.appId,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const body = await response.text().catch(() => 'Unknown error');
        throw new Error(`Ontraport API error (${response.status}): ${body}`);
      }

      return response.json() as Promise<T>;
    });
  }

  async listContacts(options?: { limit?: number; offset?: number; tag?: string }): Promise<PaginatedResult<UnifiedContact>> {
    const params: Record<string, string> = {
      objectID: '0',
      range: String(options?.limit ?? 20),
      start: String(options?.offset ?? 0),
    };

    if (options?.tag) {
      params.condition = JSON.stringify([
        { field: { field: 'tag_list' }, op: 'LIKE', value: { value: `%${options.tag}%` } },
      ]);
    }

    const query = new URLSearchParams(params).toString();
    const data = await this.request<{ data: unknown[]; count: number }>(`/Contacts?${query}`);

    const items = (data.data ?? []).map((c: any) => this.mapContact(c));
    return {
      items,
      total: data.count ?? items.length,
      page: Math.floor((options?.offset ?? 0) / (options?.limit ?? 20)) + 1,
      pageSize: options?.limit ?? 20,
      hasMore: (options?.offset ?? 0) + (options?.limit ?? 20) < (data.count ?? 0),
    };
  }

  async getContact(id: string): Promise<UnifiedContact> {
    const data = await this.request<{ data: unknown }>(`/Contact?objectID=0&id=${id}`);
    return this.mapContact(data.data);
  }

  async searchContacts(query: string): Promise<UnifiedContact[]> {
    const params = new URLSearchParams({
      objectID: '0',
      search: query,
    });

    const data = await this.request<{ data: unknown[] }>(`/Contacts?${params.toString()}`);
    return (data.data ?? []).map((c: any) => this.mapContact(c));
  }

  async createContact(input: NewContact): Promise<UnifiedContact> {
    const data = await this.request<{ data: unknown }>('/Contacts', {
      method: 'POST',
      body: JSON.stringify({
        objectID: 0,
        firstname: input.firstName,
        lastname: input.lastName,
        email: input.email,
        sms_number: input.phone,
        tag_list: input.tags?.join(','),
        source: input.source,
      }),
    });
    return this.mapContact(data.data);
  }

  async updateContact(id: string, input: Partial<NewContact>): Promise<UnifiedContact> {
    const payload: Record<string, unknown> = { objectID: 0, id };
    if (input.firstName) payload.firstname = input.firstName;
    if (input.lastName) payload.lastname = input.lastName;
    if (input.email) payload.email = input.email;
    if (input.phone) payload.sms_number = input.phone;
    if (input.tags) payload.tag_list = input.tags.join(',');

    const data = await this.request<{ data: unknown }>('/Contacts', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return this.mapContact(data.data);
  }

  private mapContact(raw: any): UnifiedContact {
    return {
      id: String(raw.id ?? raw.contact_id ?? ''),
      firstName: raw.firstname ?? raw.firstName ?? '',
      lastName: raw.lastname ?? raw.lastName ?? '',
      email: raw.email,
      phone: raw.sms_number ?? raw.phone,
      tags: raw.tag_list ? String(raw.tag_list).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      source: raw.source ?? 'ontraport',
      createdAt: raw.date ? new Date(parseInt(raw.date, 10) * 1000).toISOString() : '',
      customFields: this.extractCustomFields(raw),
    };
  }

  private extractCustomFields(raw: any): Record<string, unknown> {
    const standard = new Set(['id', 'contact_id', 'firstname', 'lastname', 'email', 'sms_number', 'tag_list', 'source', 'date']);
    const custom: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (!standard.has(key) && key.startsWith('f')) {
        custom[key] = value;
      }
    }
    return custom;
  }
}
