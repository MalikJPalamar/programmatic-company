import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp } from '../src/app.js';

describe('API Key Auth', () => {
  const originalKey = process.env.UAPP_API_KEY;

  beforeEach(() => {
    process.env.UAPP_API_KEY = 'test-secret-key';
  });

  afterEach(() => {
    if (originalKey !== undefined) {
      process.env.UAPP_API_KEY = originalKey;
    } else {
      delete process.env.UAPP_API_KEY;
    }
  });

  it('rejects requests without API key', async () => {
    const app = createApp();
    const res = await app.request('/route', { method: 'POST' });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('AUTH_MISSING');
  });

  it('rejects requests with invalid API key', async () => {
    const app = createApp();
    const res = await app.request('/route', {
      method: 'POST',
      headers: { 'X-API-Key': 'wrong-key' },
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('AUTH_INVALID');
  });

  it('accepts requests with valid X-API-Key header', async () => {
    const app = createApp();
    const res = await app.request('/route', {
      method: 'POST',
      headers: {
        'X-API-Key': 'test-secret-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target: 'nonexistent', command: 'test' }),
    });

    // Should get past auth (404 for target is expected)
    expect(res.status).toBe(404);
  });

  it('accepts requests with valid Bearer token', async () => {
    const app = createApp();
    const res = await app.request('/route', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-secret-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target: 'nonexistent', command: 'test' }),
    });

    expect(res.status).toBe(404);
  });

  it('allows health check without auth', async () => {
    const app = createApp();
    const res = await app.request('/health');
    expect(res.status).toBe(200);
  });
});
