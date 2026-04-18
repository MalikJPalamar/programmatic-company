import { Hono } from 'hono';
import { metrics } from '../middleware/metrics.js';

export const monitoringRoutes = new Hono();

monitoringRoutes.get('/monitoring', (c) => {
  const window = parseInt(c.req.query('window') ?? '60', 10);
  const summary = metrics.getSummary(window);
  return c.json({ success: true, data: summary });
});

monitoringRoutes.get('/monitoring/live', (c) => {
  const summary = metrics.getSummary(5);
  return c.json({
    success: true,
    data: {
      status: summary.error_rate > 10 ? 'degraded' : 'healthy',
      requests_last_5m: summary.total_requests,
      errors_last_5m: summary.error_count,
      avg_latency_ms: summary.avg_latency_ms,
      uptime_seconds: summary.uptime_seconds,
    },
  });
});
