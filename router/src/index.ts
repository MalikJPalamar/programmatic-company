import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { registerTarget } from './registry.js';
import { execCLI, parseCLIOutput } from './cli-executor.js';
import { logAudit } from './mission-control.js';

const app = createApp();

registerTarget({
  name: 'builderbee',
  description: 'GHL API wrapper for web agency operations',
  commands: [
    'clients.list',
    'clients.get',
    'clients.create',
    'clients.update',
    'clients.delete',
    'contacts.list',
    'contacts.search',
    'contacts.create',
    'contacts.update',
    'workflows.list',
    'workflows.trigger',
    'workflows.pause',
    'workflows.status',
    'snapshots.list',
    'snapshots.deploy',
    'health.check',
  ],
  handler: async (command, args) => {
    const startMs = Date.now();
    try {
      const result = await execCLI('builderbee', command, args);
      const parsed = parseCLIOutput(result);
      await logAudit({
        timestamp: new Date().toISOString(),
        target: 'builderbee', command,
        success: result.exitCode === 0,
        duration_ms: Date.now() - startMs,
        error: result.exitCode === 0 ? undefined : result.stderr,
      });
      return parsed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await logAudit({
        timestamp: new Date().toISOString(),
        target: 'builderbee', command,
        success: false, duration_ms: Date.now() - startMs, error: message,
      });
      throw err;
    }
  },
});

// Register AOB target
registerTarget({
  name: 'aob',
  description: 'Unified CLI across Ontraport, Stripe, Mighty Networks',
  commands: [
    'students.list', 'students.get', 'students.search',
    'contacts.list', 'contacts.get', 'contacts.search', 'contacts.create', 'contacts.update',
    'payments.list', 'payments.status',
    'community.members', 'community.lookup',
    'programs.list', 'programs.get',
    'cohorts.list', 'cohorts.get',
    'certifications.check', 'certifications.issue', 'certifications.list',
  ],
  handler: async (command, args) => {
    const startMs = Date.now();
    try {
      const result = await execCLI('aob', command, args);
      const parsed = parseCLIOutput(result);
      await logAudit({
        timestamp: new Date().toISOString(),
        target: 'aob', command,
        success: result.exitCode === 0,
        duration_ms: Date.now() - startMs,
        error: result.exitCode === 0 ? undefined : result.stderr,
      });
      return parsed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await logAudit({
        timestamp: new Date().toISOString(),
        target: 'aob', command,
        success: false, duration_ms: Date.now() - startMs, error: message,
      });
      throw err;
    }
  },
});

// Register Centaurion target
registerTarget({
  name: 'centaurion',
  description: 'Meta-orchestration layer — agent registry, task routing, memory',
  commands: [
    'agents.list', 'agents.health', 'agents.get',
    'route.task',
    'memory.store', 'memory.relate', 'memory.query', 'memory.list',
  ],
  handler: async (command, args) => {
    const startMs = Date.now();
    try {
      const result = await execCLI('centaurion', command, args);
      const parsed = parseCLIOutput(result);
      await logAudit({
        timestamp: new Date().toISOString(),
        target: 'centaurion', command,
        success: result.exitCode === 0,
        duration_ms: Date.now() - startMs,
        error: result.exitCode === 0 ? undefined : result.stderr,
      });
      return parsed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await logAudit({
        timestamp: new Date().toISOString(),
        target: 'centaurion', command,
        success: false, duration_ms: Date.now() - startMs, error: message,
      });
      throw err;
    }
  },
});

const port = parseInt(process.env.PORT ?? '3100', 10);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`UAPP Router running on http://localhost:${info.port}`);
  console.log(`Mission Control: http://localhost:${info.port}/mission-control`);
});
