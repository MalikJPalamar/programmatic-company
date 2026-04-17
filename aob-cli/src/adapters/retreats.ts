import type { RetreatAdapter, Retreat, Booking } from '../types.js';

export interface RetreatGuruConfig {
  apiKey: string;
  baseUrl?: string;
}

export class RetreatGuruAdapter implements RetreatAdapter {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: RetreatGuruConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.retreat.guru/api/v1';
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}${path}${sep}api_key=${this.apiKey}`;
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => 'Unknown error');
      throw new Error(`RetreatGuru API error (${response.status}): ${body}`);
    }

    return response.json() as Promise<T>;
  }

  async listRetreats(options?: { location?: string; upcoming?: boolean }): Promise<Retreat[]> {
    let path = '/programs';
    const params: string[] = [];
    if (options?.upcoming) params.push('filter[status]=upcoming');
    if (options?.location) params.push(`filter[location]=${encodeURIComponent(options.location)}`);
    if (params.length > 0) path += '?' + params.join('&');

    const data = await this.request<unknown[]>(path);
    return (data ?? []).map((r: any) => this.mapRetreat(r));
  }

  async getRetreat(id: string): Promise<Retreat> {
    const data = await this.request<unknown>(`/programs/${id}`);
    return this.mapRetreat(data);
  }

  async listBookings(retreatId: string): Promise<Booking[]> {
    const data = await this.request<unknown[]>(`/registrations?filter[program_id]=${retreatId}`);
    return (data ?? []).map((b: any) => this.mapBooking(b));
  }

  async getBooking(id: string): Promise<Booking> {
    const data = await this.request<unknown>(`/registrations/${id}`);
    return this.mapBooking(data);
  }

  async createBooking(retreatId: string, guest: { name: string; email: string }): Promise<Booking> {
    const data = await this.request<unknown>('/registrations', {
      method: 'POST',
      body: JSON.stringify({
        program_id: retreatId,
        first_name: guest.name.split(' ')[0],
        last_name: guest.name.split(' ').slice(1).join(' ') || guest.name,
        email: guest.email,
      }),
    });
    return this.mapBooking(data);
  }

  async checkAvailability(retreatId: string): Promise<{ available: boolean; spotsRemaining: number }> {
    const retreat = await this.getRetreat(retreatId);
    return {
      available: retreat.spotsRemaining > 0 && retreat.status === 'upcoming',
      spotsRemaining: retreat.spotsRemaining,
    };
  }

  private mapRetreat(raw: any): Retreat {
    return {
      id: String(raw.id ?? ''),
      name: raw.name ?? raw.title ?? '',
      location: raw.location ?? raw.venue_name ?? '',
      startDate: raw.start_date ?? '',
      endDate: raw.end_date ?? '',
      capacity: parseInt(raw.capacity ?? '0', 10),
      spotsRemaining: parseInt(raw.spots_remaining ?? raw.available_spaces ?? '0', 10),
      price: parseFloat(raw.price ?? '0'),
      currency: raw.currency ?? 'USD',
      status: this.mapStatus(raw.status),
    };
  }

  private mapBooking(raw: any): Booking {
    return {
      id: String(raw.id ?? ''),
      retreatId: String(raw.program_id ?? ''),
      retreatName: raw.program_name ?? '',
      guestName: `${raw.first_name ?? ''} ${raw.last_name ?? ''}`.trim(),
      guestEmail: raw.email ?? '',
      status: this.mapBookingStatus(raw.status),
      bookedAt: raw.created_at ?? '',
      amount: parseFloat(raw.total ?? raw.amount ?? '0'),
      currency: raw.currency ?? 'USD',
    };
  }

  private mapStatus(status: string): Retreat['status'] {
    switch (status) {
      case 'published': case 'upcoming': return 'upcoming';
      case 'active': case 'in_progress': return 'active';
      case 'completed': case 'past': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return 'upcoming';
    }
  }

  private mapBookingStatus(status: string): Booking['status'] {
    switch (status) {
      case 'confirmed': case 'approved': return 'confirmed';
      case 'pending': case 'awaiting_payment': return 'pending';
      case 'cancelled': case 'refunded': return 'cancelled';
      case 'waitlisted': return 'waitlisted';
      default: return 'pending';
    }
  }
}
