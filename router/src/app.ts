import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { apiKeyAuth } from './middleware/auth.js';
import { healthRoutes } from './routes/health.js';
import { routeRoutes } from './routes/route.js';

export function createApp() {
  const app = new Hono();

  // Middleware
  app.use('*', logger());
  app.use('*', cors());

  // Health check is public
  app.route('/', healthRoutes);

  // All other routes require auth
  app.use('/route', apiKeyAuth());
  app.use('/targets', apiKeyAuth());
  app.route('/', routeRoutes);

  // Root
  app.get('/', (c) => {
    return c.json({
      name: 'UAPP Router',
      version: '0.1.0',
      description: 'Universal Agent-to-Production Pipeline',
      endpoints: {
        'GET /health': 'Health check (public)',
        'GET /targets': 'List registered targets (auth required)',
        'POST /route': 'Route command to target CLI (auth required)',
      },
    });
  });

  return app;
}
