import type { Context, Next } from 'hono';

interface RequestMetric {
  path: string;
  method: string;
  status: number;
  duration_ms: number;
  timestamp: string;
}

class MetricsCollector {
  private requests: RequestMetric[] = [];
  private startedAt = Date.now();
  private maxHistory = 10000;

  record(metric: RequestMetric): void {
    this.requests.push(metric);
    if (this.requests.length > this.maxHistory) {
      this.requests = this.requests.slice(-this.maxHistory);
    }
  }

  getSummary(windowMinutes = 60): {
    uptime_seconds: number;
    window_minutes: number;
    total_requests: number;
    error_count: number;
    error_rate: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    requests_per_minute: number;
    by_target: Record<string, { count: number; errors: number; avg_ms: number }>;
    by_status: Record<string, number>;
  } {
    const cutoff = Date.now() - windowMinutes * 60 * 1000;
    const recent = this.requests.filter((r) => new Date(r.timestamp).getTime() > cutoff);

    const errors = recent.filter((r) => r.status >= 400);
    const durations = recent.map((r) => r.duration_ms).sort((a, b) => a - b);
    const p95Idx = Math.floor(durations.length * 0.95);

    const byTarget: Record<string, { count: number; errors: number; totalMs: number }> = {};
    const byStatus: Record<string, number> = {};

    for (const r of recent) {
      // Extract target from /route requests
      const target = r.path.startsWith('/route') ? 'route' : r.path.split('/')[1] || 'root';
      if (!byTarget[target]) byTarget[target] = { count: 0, errors: 0, totalMs: 0 };
      byTarget[target].count++;
      byTarget[target].totalMs += r.duration_ms;
      if (r.status >= 400) byTarget[target].errors++;

      const statusKey = `${Math.floor(r.status / 100)}xx`;
      byStatus[statusKey] = (byStatus[statusKey] ?? 0) + 1;
    }

    const targetSummary: Record<string, { count: number; errors: number; avg_ms: number }> = {};
    for (const [key, val] of Object.entries(byTarget)) {
      targetSummary[key] = {
        count: val.count,
        errors: val.errors,
        avg_ms: Math.round(val.totalMs / val.count),
      };
    }

    return {
      uptime_seconds: Math.floor((Date.now() - this.startedAt) / 1000),
      window_minutes: windowMinutes,
      total_requests: recent.length,
      error_count: errors.length,
      error_rate: recent.length > 0 ? Math.round((errors.length / recent.length) * 10000) / 100 : 0,
      avg_latency_ms: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
      p95_latency_ms: durations[p95Idx] ?? 0,
      requests_per_minute: recent.length > 0 ? Math.round((recent.length / windowMinutes) * 100) / 100 : 0,
      by_target: targetSummary,
      by_status: byStatus,
    };
  }
}

export const metrics = new MetricsCollector();

export function metricsMiddleware() {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    await next();
    metrics.record({
      path: new URL(c.req.url).pathname,
      method: c.req.method,
      status: c.res.status,
      duration_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  };
}
