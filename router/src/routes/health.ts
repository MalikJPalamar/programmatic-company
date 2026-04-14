import { Hono } from 'hono';
import type { HealthStatus } from '../types.js';
import { getRegistry } from '../registry.js';

const startTime = Date.now();

export const healthRoutes = new Hono();

healthRoutes.get('/health', (c) => {
  const registry = getRegistry();
  const targets: HealthStatus['targets'] = {};

  for (const [name, config] of Object.entries(registry)) {
    targets[name] = {
      status: 'available',
      commands: config.commands.length,
    };
  }

  const health: HealthStatus = {
    status: Object.keys(targets).length > 0 ? 'healthy' : 'degraded',
    version: '0.1.0',
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    targets,
  };

  return c.json(health);
});
