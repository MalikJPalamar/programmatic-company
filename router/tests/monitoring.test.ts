import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp } from '../src/app.js';

describe('Monitoring Routes', () => {
  const originalKey = process.env.UAPP_API_KEY;

  beforeEach(() => { process.env.UAPP_API_KEY = 'test-key'; });
  afterEach(() => {
    if (originalKey !== undefined) process.env.UAPP_API_KEY = originalKey;
    else delete process.env.UAPP_API_KEY;
  });

  const authHeaders = { 'X-API-Key': 'test-key' };

  it('GET /monitoring returns metrics summary', async () => {
    const app = createApp();
    const res = await app.request('/monitoring', { headers: authHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.uptime_seconds).toBeDefined();
    expect(typeof body.data.total_requests).toBe('number');
    expect(typeof body.data.error_rate).toBe('number');
  });

  it('GET /monitoring/live returns quick health', async () => {
    const app = createApp();
    const res = await app.request('/monitoring/live', { headers: authHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBeDefined();
    expect(['healthy', 'degraded']).toContain(body.data.status);
  });

  it('GET /monitoring requires auth', async () => {
    const app = createApp();
    const res = await app.request('/monitoring');
    expect(res.status).toBe(401);
  });

  it('accepts window query param', async () => {
    const app = createApp();
    const res = await app.request('/monitoring?window=5', { headers: authHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.window_minutes).toBe(5);
  });
});
