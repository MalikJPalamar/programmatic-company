import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RetreatGuruAdapter } from '../../src/adapters/retreats.js';

const mockRetreats = [
  { id: 'r001', name: 'Summer Breathwork Retreat', location: 'ASHA', start_date: '2026-07-15', end_date: '2026-07-22', capacity: '20', spots_remaining: '8', price: '2500', currency: 'USD', status: 'published' },
  { id: 'r002', name: 'Fall Teacher Training', location: 'ASHA', start_date: '2026-10-01', end_date: '2026-10-14', capacity: '15', spots_remaining: '0', price: '4500', currency: 'USD', status: 'published' },
  { id: 'r003', name: 'Winter Yoga Intensive', location: 'Bali', start_date: '2026-01-10', end_date: '2026-01-17', capacity: '25', spots_remaining: '12', price: '1800', currency: 'USD', status: 'past' },
];

const mockRetreat = { id: 'r001', name: 'Summer Breathwork Retreat', location: 'ASHA', start_date: '2026-07-15', end_date: '2026-07-22', capacity: '20', spots_remaining: '8', price: '2500', currency: 'USD', status: 'published' };

const mockBookings = [
  { id: 'b001', program_id: 'r001', program_name: 'Summer Breathwork', first_name: 'Sarah', last_name: 'Chen', email: 'sarah@example.com', status: 'confirmed', created_at: '2026-04-01', total: '2500', currency: 'USD' },
  { id: 'b002', program_id: 'r001', program_name: 'Summer Breathwork', first_name: 'Marcus', last_name: 'Reed', email: 'marcus@example.com', status: 'pending', created_at: '2026-04-10', total: '2500', currency: 'USD' },
];

const mockBooking = { id: 'b001', program_id: 'r001', program_name: 'Summer Breathwork', first_name: 'Sarah', last_name: 'Chen', email: 'sarah@example.com', status: 'confirmed', created_at: '2026-04-01', total: '2500', currency: 'USD' };

const mockCreatedBooking = { id: 'b003', program_id: 'r001', program_name: 'Summer Breathwork', first_name: 'Alice', last_name: 'Wonder', email: 'alice@example.com', status: 'pending', created_at: '2026-04-15', total: '2500', currency: 'USD' };

describe('RetreatGuruAdapter', () => {
  const adapter = new RetreatGuruAdapter({ apiKey: 'test-key', baseUrl: 'https://mock.retreatguru' });
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => { fetchSpy = vi.spyOn(globalThis, 'fetch'); });
  afterEach(() => { fetchSpy.mockRestore(); });

  function mockFetch(data: unknown) {
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }

  describe('retreats', () => {
    it('lists all retreats', async () => {
      mockFetch(mockRetreats);
      const retreats = await adapter.listRetreats();
      expect(retreats).toHaveLength(3);
      expect(retreats[0].name).toBe('Summer Breathwork Retreat');
      expect(retreats[0].location).toBe('ASHA');
      expect(retreats[0].spotsRemaining).toBe(8);
    });

    it('gets a single retreat', async () => {
      mockFetch(mockRetreat);
      const retreat = await adapter.getRetreat('r001');
      expect(retreat.id).toBe('r001');
      expect(retreat.price).toBe(2500);
      expect(retreat.status).toBe('upcoming');
    });

    it('checks availability — spots available', async () => {
      mockFetch(mockRetreat);
      const avail = await adapter.checkAvailability('r001');
      expect(avail.available).toBe(true);
      expect(avail.spotsRemaining).toBe(8);
    });

    it('checks availability — sold out', async () => {
      mockFetch({ ...mockRetreats[1] });
      const avail = await adapter.checkAvailability('r002');
      expect(avail.available).toBe(false);
      expect(avail.spotsRemaining).toBe(0);
    });

    it('maps status correctly', async () => {
      mockFetch(mockRetreats[2]);
      const retreat = await adapter.getRetreat('r003');
      expect(retreat.status).toBe('completed');
    });
  });

  describe('bookings', () => {
    it('lists bookings for a retreat', async () => {
      mockFetch(mockBookings);
      const bookings = await adapter.listBookings('r001');
      expect(bookings).toHaveLength(2);
      expect(bookings[0].guestName).toBe('Sarah Chen');
      expect(bookings[0].status).toBe('confirmed');
      expect(bookings[0].amount).toBe(2500);
    });

    it('gets a single booking', async () => {
      mockFetch(mockBooking);
      const booking = await adapter.getBooking('b001');
      expect(booking.id).toBe('b001');
      expect(booking.guestEmail).toBe('sarah@example.com');
    });

    it('creates a booking', async () => {
      mockFetch(mockCreatedBooking);
      const booking = await adapter.createBooking('r001', { name: 'Alice Wonder', email: 'alice@example.com' });
      expect(booking.id).toBe('b003');
      expect(booking.guestName).toBe('Alice Wonder');
      expect(booking.status).toBe('pending');
    });
  });

  it('throws on API error', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Forbidden', { status: 403 }));
    await expect(adapter.listRetreats()).rejects.toThrow('RetreatGuru API error (403)');
  });
});
