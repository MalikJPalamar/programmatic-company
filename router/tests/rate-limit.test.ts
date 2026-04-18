import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp } from '../src/app.js';

describe('Rate Limiting', () => {
  const originalKey = process.env.UAPP_API_KEY;

  beforeEach(() => { process.env.UAPP_API_KEY = 'test-key'; });
  afterEach(() => {
    if (originalKey !== undefined) process.env.UAPP_API_KEY = originalKey;
    else delete process.env.UAPP_API_KEY;
  });

  const authHeaders = { 'X-API-Key': 'test-key', 'Content-Type': 'application/json' };

  it('includes rate limit headers in response', async () => {
    const app = createApp();
    const res = await app.request('/route', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ target: 'nonexistent', command: 'test' }),
    });

    expect(res.headers.get('X-RateLimit-Limit')).toBeDefined();
    expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();
    expect(res.headers.get('X-RateLimit-Reset')).toBeDefined();
  });

  it('decrements remaining count per request', async () => {
    const app = createApp();
    const res1 = await app.request('/route', {
      method: 'POST',
      headers: { ...authHeaders, 'X-API-Key': 'unique-key-1' },
      body: JSON.stringify({ target: 'test', command: 'test' }),
    });
    const remaining1 = parseInt(res1.headers.get('X-RateLimit-Remaining') ?? '0', 10);

    const res2 = await app.request('/route', {
      method: 'POST',
      headers: { ...authHeaders, 'X-API-Key': 'unique-key-1' },
      body: JSON.stringify({ target: 'test', command: 'test' }),
    });
    const remaining2 = parseInt(res2.headers.get('X-RateLimit-Remaining') ?? '0', 10);

    expect(remaining2).toBeLessThan(remaining1);
  });
});
