import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { createApp } from '../src/app.js';
import { registerTarget } from '../src/registry.js';

describe('POST /route', () => {
  const originalKey = process.env.UAPP_API_KEY;

  beforeAll(() => {
    registerTarget({
      name: 'mockbee',
      description: 'Mock BuilderBee',
      commands: ['clients.list', 'clients.get', 'error.throw'],
      handler: async (command, args) => {
        if (command === 'error.throw') {
          throw new Error('Simulated failure');
        }
        return { command, args, mock: true };
      },
    });
  });

  beforeEach(() => {
    process.env.UAPP_API_KEY = 'test-key';
  });

  afterEach(() => {
    if (originalKey !== undefined) {
      process.env.UAPP_API_KEY = originalKey;
    } else {
      delete process.env.UAPP_API_KEY;
    }
  });

  const authHeaders = {
    'X-API-Key': 'test-key',
    'Content-Type': 'application/json',
  };

  it('routes valid command to target', async () => {
    const app = createApp();
    const res = await app.request('/route', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        target: 'mockbee',
        command: 'clients.list',
        args: { limit: 10 },
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.command).toBe('clients.list');
    expect(body.data.args).toEqual({ limit: 10 });
    expect(body.meta.target).toBe('mockbee');
    expect(body.meta.command).toBe('clients.list');
    expect(typeof body.meta.duration_ms).toBe('number');
  });

  it('returns 400 for missing target/command', async () => {
    const app = createApp();
    const res = await app.request('/route', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('INVALID_REQUEST');
  });

  it('returns 404 for unknown target', async () => {
    const app = createApp();
    const res = await app.request('/route', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ target: 'nonexistent', command: 'foo' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('TARGET_NOT_FOUND');
  });

  it('returns 404 for unknown command on known target', async () => {
    const app = createApp();
    const res = await app.request('/route', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ target: 'mockbee', command: 'unknown.cmd' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('COMMAND_NOT_FOUND');
  });

  it('returns 500 when handler throws', async () => {
    const app = createApp();
    const res = await app.request('/route', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ target: 'mockbee', command: 'error.throw' }),
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('EXECUTION_ERROR');
    expect(body.error.message).toBe('Simulated failure');
  });
});

describe('GET /targets', () => {
  const originalKey = process.env.UAPP_API_KEY;

  beforeEach(() => {
    process.env.UAPP_API_KEY = 'test-key';
  });

  afterEach(() => {
    if (originalKey !== undefined) {
      process.env.UAPP_API_KEY = originalKey;
    } else {
      delete process.env.UAPP_API_KEY;
    }
  });

  it('lists registered targets', async () => {
    const app = createApp();
    const res = await app.request('/targets', {
      headers: { 'X-API-Key': 'test-key' },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });
});
