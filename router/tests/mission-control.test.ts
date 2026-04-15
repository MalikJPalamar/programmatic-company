import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp } from '../src/app.js';

describe('Mission Control Routes', () => {
  const originalKey = process.env.UAPP_API_KEY;

  beforeEach(() => { process.env.UAPP_API_KEY = 'test-key'; });
  afterEach(() => {
    if (originalKey !== undefined) process.env.UAPP_API_KEY = originalKey;
    else delete process.env.UAPP_API_KEY;
  });

  const authHeaders = { 'X-API-Key': 'test-key' };

  it('GET /mission-control returns pipeline status', async () => {
    const app = createApp();
    const res = await app.request('/mission-control', { headers: authHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.lastUpdated).toBeDefined();
    expect(body.data.pipelineHealth).toBeDefined();
    expect(body.data.targets).toBeDefined();
    expect(body.data.recentActivity).toBeInstanceOf(Array);
  });

  it('GET /mission-control requires auth', async () => {
    const app = createApp();
    const res = await app.request('/mission-control');
    expect(res.status).toBe(401);
  });

  it('GET /mission-control/audit returns audit log', async () => {
    const app = createApp();
    const res = await app.request('/mission-control/audit', { headers: authHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeInstanceOf(Array);
  });

  it('GET /mission-control/audit accepts limit param', async () => {
    const app = createApp();
    const res = await app.request('/mission-control/audit?limit=5', { headers: authHeaders });
    expect(res.status).toBe(200);
  });

  it('POST /mission-control/score scores a cycle', async () => {
    const app = createApp();
    const res = await app.request('/mission-control/score', {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ cycleId: 'test-cycle', testResults: { total: 30, passed: 30, failed: 0 } }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.cycle).toBe('test-cycle');
    expect(body.data.compositeScore).toBeGreaterThan(0);
  });
});
