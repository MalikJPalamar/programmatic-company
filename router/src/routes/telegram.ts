import { Hono } from 'hono';
import { execCLI, parseCLIOutput } from '../cli-executor.js';
import { logAudit } from '../mission-control.js';

export const telegramRoutes = new Hono();

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string; username?: string };
    chat: { id: number; type: string };
    date: number;
    text?: string;
  };
}

const TELEGRAM_TOKEN = () => process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_CHAT_IDS = () => {
  const ids = process.env.TELEGRAM_ALLOWED_CHAT_IDS;
  return ids ? ids.split(',').map((id) => parseInt(id.trim(), 10)) : [];
};

async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  const token = TELEGRAM_TOKEN();
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  }).catch(() => {});
}

telegramRoutes.post('/webhook/telegram', async (c) => {
  const token = TELEGRAM_TOKEN();
  if (!token) {
    return c.json({ success: false, error: { code: 'TELEGRAM_NOT_CONFIGURED', message: 'TELEGRAM_BOT_TOKEN not set' } }, 500);
  }

  const update = await c.req.json<TelegramUpdate>().catch(() => null);
  if (!update?.message?.text) {
    return c.json({ ok: true });
  }

  const { message } = update;
  const chatId = message.chat.id;
  const text = message.text!.trim();
  const username = message.from.username ?? message.from.first_name;

  // Access control
  const allowed = ALLOWED_CHAT_IDS();
  if (allowed.length > 0 && !allowed.includes(chatId)) {
    await sendTelegramMessage(chatId, 'Access denied. Your chat ID is not authorized.');
    return c.json({ ok: true });
  }

  // Handle /help
  if (text === '/help' || text === '/start') {
    await sendTelegramMessage(chatId, [
      '*UAPP Bot*',
      '',
      'Send any command in natural language:',
      '• "List clients"',
      '• "Run SA scan"',
      '• "Check student enrollment"',
      '• "Show pipeline health"',
      '',
      'Or use direct commands:',
      '• `/status` — pipeline health',
      '• `/scan` — run SA scan on default tickers',
      '• `/help` — this message',
    ].join('\n'));
    return c.json({ ok: true });
  }

  // Handle /status shortcut
  if (text === '/status') {
    try {
      const result = await execCLI('centaurion', 'pipeline.health');
      const parsed = parseCLIOutput(result);
      await sendTelegramMessage(chatId, '```\n' + JSON.stringify(parsed, null, 2) + '\n```');
    } catch {
      await sendTelegramMessage(chatId, 'Failed to get pipeline status.');
    }
    return c.json({ ok: true });
  }

  // Handle /scan shortcut
  if (text === '/scan') {
    try {
      const result = await execCLI('centaurion', 'sa-scan.run', { tickers: 'SPY,QQQ,IWM' });
      const parsed = parseCLIOutput(result);
      const report = parsed as { summary?: string };
      await sendTelegramMessage(chatId, report.summary ?? JSON.stringify(parsed, null, 2));
    } catch {
      await sendTelegramMessage(chatId, 'SA scan failed.');
    }
    return c.json({ ok: true });
  }

  // Route natural language through Centaurion
  const startMs = Date.now();
  try {
    const routeResult = await execCLI('centaurion', 'route.task', { _positional: [text] });
    const decision = parseCLIOutput(routeResult) as {
      target?: string;
      command?: string;
      confidence?: number;
      reasoning?: string;
    };

    if (!decision.target || !decision.command || (decision.confidence ?? 0) === 0) {
      await sendTelegramMessage(chatId, `I couldn't understand: "${text}"\n\nTry /help for examples.`);
      return c.json({ ok: true });
    }

    // Execute the routed command
    const execResult = await execCLI(decision.target, decision.command);
    const output = parseCLIOutput(execResult);

    const responseText = typeof output === 'string'
      ? output
      : '```\n' + JSON.stringify(output, null, 2).slice(0, 3500) + '\n```';

    await sendTelegramMessage(chatId, responseText);

    await logAudit({
      timestamp: new Date().toISOString(),
      target: decision.target,
      command: decision.command,
      success: true,
      duration_ms: Date.now() - startMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await sendTelegramMessage(chatId, `Error: ${message}`);
    await logAudit({
      timestamp: new Date().toISOString(),
      target: 'telegram',
      command: text,
      success: false,
      duration_ms: Date.now() - startMs,
      error: message,
    });
  }

  return c.json({ ok: true });
});

// Setup endpoint — registers the webhook with Telegram (auth required)
telegramRoutes.post('/webhook/telegram/setup', async (c) => {
  const apiKey = c.req.header('X-API-Key') ?? c.req.header('Authorization')?.replace('Bearer ', '');
  const validKey = process.env.UAPP_API_KEY;
  if (!apiKey || !validKey || apiKey !== validKey) {
    return c.json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'API key required for setup' } }, 401);
  }

  const token = TELEGRAM_TOKEN();
  if (!token) {
    return c.json({ success: false, error: { code: 'NO_TOKEN', message: 'TELEGRAM_BOT_TOKEN not set' } }, 500);
  }

  const body = await c.req.json<{ webhook_url: string }>().catch(() => null);
  if (!body?.webhook_url) {
    return c.json({ success: false, error: { code: 'MISSING_URL', message: 'Provide webhook_url in body' } }, 400);
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: body.webhook_url }),
  });

  const result = await res.json();
  return c.json({ success: true, data: result });
});
