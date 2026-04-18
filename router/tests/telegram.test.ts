import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createApp } from '../src/app.js';

describe('Telegram Webhook', () => {
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalKey = process.env.UAPP_API_KEY;
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.UAPP_API_KEY = 'test-key';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    if (originalToken !== undefined) process.env.TELEGRAM_BOT_TOKEN = originalToken;
    else delete process.env.TELEGRAM_BOT_TOKEN;
    if (originalKey !== undefined) process.env.UAPP_API_KEY = originalKey;
    else delete process.env.UAPP_API_KEY;
    fetchSpy.mockRestore();
  });

  function mockTelegramSend() {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  }

  it('returns ok for empty updates', async () => {
    const app = createApp();
    const res = await app.request('/webhook/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ update_id: 1 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('responds to /help command', async () => {
    mockTelegramSend();
    const app = createApp();
    const res = await app.request('/webhook/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        update_id: 2,
        message: {
          message_id: 1,
          from: { id: 123, first_name: 'Test' },
          chat: { id: 123, type: 'private' },
          date: Date.now(),
          text: '/help',
        },
      }),
    });
    expect(res.status).toBe(200);
  });

  it('responds to /start command', async () => {
    mockTelegramSend();
    const app = createApp();
    const res = await app.request('/webhook/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        update_id: 3,
        message: {
          message_id: 2,
          from: { id: 123, first_name: 'Test' },
          chat: { id: 123, type: 'private' },
          date: Date.now(),
          text: '/start',
        },
      }),
    });
    expect(res.status).toBe(200);
  });

  it('denies unauthorized chat IDs when allowlist is set', async () => {
    process.env.TELEGRAM_ALLOWED_CHAT_IDS = '999';
    mockTelegramSend();
    const app = createApp();
    const res = await app.request('/webhook/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        update_id: 4,
        message: {
          message_id: 3,
          from: { id: 123, first_name: 'Test' },
          chat: { id: 123, type: 'private' },
          date: Date.now(),
          text: 'list clients',
        },
      }),
    });
    expect(res.status).toBe(200);
    delete process.env.TELEGRAM_ALLOWED_CHAT_IDS;
  });

  it('setup endpoint requires auth', async () => {
    const app = createApp();
    const res = await app.request('/webhook/telegram/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhook_url: 'https://example.com/webhook' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 500 when token not configured', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    const app = createApp();
    const res = await app.request('/webhook/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        update_id: 5,
        message: { message_id: 4, from: { id: 1, first_name: 'X' }, chat: { id: 1, type: 'private' }, date: 0, text: 'hi' },
      }),
    });
    expect(res.status).toBe(500);
  });
});
