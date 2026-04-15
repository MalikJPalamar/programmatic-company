import { Hono } from 'hono';
import {
  getMissionControlStatus,
  generateDailyReport,
  scoreCycle,
  getRecentAudit,
} from '../mission-control.js';

export const missionControlRoutes = new Hono();

missionControlRoutes.get('/mission-control', async (c) => {
  const status = await getMissionControlStatus();
  return c.json({ success: true, data: status });
});

missionControlRoutes.get('/mission-control/report', async (c) => {
  const report = await generateDailyReport();
  return c.json({ success: true, data: { report, generatedAt: new Date().toISOString() } });
});

missionControlRoutes.post('/mission-control/score', async (c) => {
  const body = await c.req.json<{
    cycleId?: string;
    testResults?: { total: number; passed: number; failed: number };
  }>().catch(() => ({} as { cycleId?: string; testResults?: { total: number; passed: number; failed: number } }));
  const cycleId = body.cycleId ?? `v${Date.now()}`;
  const cycle = await scoreCycle(cycleId, body.testResults);
  return c.json({ success: true, data: cycle });
});

missionControlRoutes.get('/mission-control/audit', async (c) => {
  const limit = parseInt(c.req.query('limit') ?? '50', 10);
  const entries = await getRecentAudit(limit);
  return c.json({ success: true, data: entries });
});
