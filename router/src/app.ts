import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { apiKeyAuth } from './middleware/auth.js';
import { rateLimit } from './middleware/rate-limit.js';
import { metricsMiddleware } from './middleware/metrics.js';
import { healthRoutes } from './routes/health.js';
import { routeRoutes } from './routes/route.js';
import { missionControlRoutes } from './routes/mission-control.js';
import { monitoringRoutes } from './routes/monitoring.js';
import { telegramRoutes } from './routes/telegram.js';

export function createApp() {
  const app = new Hono();

  // Global middleware
  app.use('*', logger());
  app.use('*', cors());
  app.use('*', metricsMiddleware());

  // Public endpoints
  app.route('/', healthRoutes);

  // Telegram webhook — validated by token in URL, not API key
  app.route('/', telegramRoutes);

  // Rate-limited + auth-required endpoints
  app.use('/route', rateLimit({ windowMs: 60_000, maxRequests: 100 }));
  app.use('/route', apiKeyAuth());
  app.use('/targets', apiKeyAuth());
  app.route('/', routeRoutes);

  // Mission Control — auth required
  app.use('/mission-control', apiKeyAuth());
  app.use('/mission-control/*', apiKeyAuth());
  app.route('/', missionControlRoutes);

  // Monitoring — auth required
  app.use('/monitoring', apiKeyAuth());
  app.use('/monitoring/*', apiKeyAuth());
  app.route('/', monitoringRoutes);

  // Root
  app.get('/', (c) => {
    return c.json({
      name: 'UAPP Router',
      version: '0.3.0',
      description: 'Universal Agent-to-Production Pipeline',
      endpoints: {
        'GET /health': 'Health check (public)',
        'GET /targets': 'List registered targets (auth required)',
        'POST /route': 'Route command to target CLI (auth required, rate limited)',
        'POST /webhook/telegram': 'Telegram bot webhook (public, token-validated)',
        'POST /webhook/telegram/setup': 'Register webhook URL with Telegram (auth required)',
        'GET /mission-control': 'Pipeline status dashboard (auth required)',
        'GET /monitoring': 'Request metrics (auth required)',
        'GET /monitoring/live': 'Live health (auth required)',
      },
    });
  });

  return app;
}
