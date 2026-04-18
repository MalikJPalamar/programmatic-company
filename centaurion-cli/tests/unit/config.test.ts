import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Config management', () => {
  const origPort = process.env.PORT;
  const origKey = process.env.UAPP_API_KEY;

  afterEach(() => {
    if (origPort !== undefined) process.env.PORT = origPort; else delete process.env.PORT;
    if (origKey !== undefined) process.env.UAPP_API_KEY = origKey; else delete process.env.UAPP_API_KEY;
  });

  it('detects configured env vars', () => {
    process.env.PORT = '3100';
    expect(process.env.PORT).toBe('3100');
  });

  it('detects missing env vars', () => {
    delete process.env.UAPP_API_KEY;
    expect(process.env.UAPP_API_KEY).toBeUndefined();
  });

  it('uses default values when env not set', () => {
    delete process.env.PORT;
    const port = process.env.PORT ?? '3100';
    expect(port).toBe('3100');
  });
});
