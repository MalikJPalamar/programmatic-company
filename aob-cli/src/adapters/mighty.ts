import type { CommunityAdapter, CommunityMember, PaginatedResult } from '../types.js';

export interface MightyConfig {
  apiKey: string;
  communityId: string;
  baseUrl?: string;
}

export class MightyNetworksAdapter implements CommunityAdapter {
  private apiKey: string;
  private communityId: string;
  private baseUrl: string;

  constructor(config: MightyConfig) {
    this.apiKey = config.apiKey;
    this.communityId = config.communityId;
    this.baseUrl = config.baseUrl ?? 'https://api.mighty.co/v1';
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => 'Unknown error');
      throw new Error(`Mighty Networks API error (${response.status}): ${body}`);
    }

    return response.json() as Promise<T>;
  }

  async getMember(email: string): Promise<CommunityMember | null> {
    try {
      const data = await this.request<{ members: unknown[] }>(
        `/communities/${this.communityId}/members?email=${encodeURIComponent(email)}`
      );
      const members = data.members ?? [];
      if (members.length === 0) return null;
      return this.mapMember(members[0]);
    } catch {
      return null;
    }
  }

  async listMembers(options?: { limit?: number; offset?: number; group?: string }): Promise<PaginatedResult<CommunityMember>> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));
    if (options?.group) params.set('group', options.group);

    const query = params.toString();
    const data = await this.request<{ members: unknown[]; total: number }>(
      `/communities/${this.communityId}/members${query ? `?${query}` : ''}`
    );

    const items = (data.members ?? []).map((m: any) => this.mapMember(m));
    return {
      items,
      total: data.total ?? items.length,
      page: Math.floor((options?.offset ?? 0) / (options?.limit ?? 20)) + 1,
      pageSize: options?.limit ?? 20,
      hasMore: (options?.offset ?? 0) + (options?.limit ?? 20) < (data.total ?? 0),
    };
  }

  async isActive(email: string): Promise<boolean> {
    const member = await this.getMember(email);
    if (!member) return false;
    return member.active;
  }

  private mapMember(raw: any): CommunityMember {
    return {
      id: String(raw.id ?? ''),
      name: raw.name ?? `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim(),
      email: raw.email ?? '',
      joinedAt: raw.joinedAt ?? raw.createdAt ?? '',
      lastActiveAt: raw.lastActiveAt,
      groups: raw.groups ?? raw.spaces ?? [],
      active: raw.active ?? raw.status === 'active',
    };
  }
}
