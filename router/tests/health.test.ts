import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';
import { registerTarget } from '../src/registry.js';

describe('GET /health', () => {
  it('returns health status with registered targets', async () => {
    registerTarget({
      name: 'test-target',
      description: 'Test target',
      commands: ['cmd.one', 'cmd.two'],
      handler: async () => ({}),
    });

    const app = createApp();
    const res = await app.request('/health');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('healthy');
    expect(body.version).toBe('0.1.0');
    expect(typeof body.uptime_seconds).toBe('number');
    expect(body.targets['test-target']).toEqual({
      status: 'available',
      commands: 2,
    });
  });
});

describe('GET /', () => {
  it('returns API info', async () => {
    const app = createApp();
    const res = await app.request('/');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.name).toBe('UAPP Router');
    expect(body.endpoints).toBeDefined();
  });
});
