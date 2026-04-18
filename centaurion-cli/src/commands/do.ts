import { Command } from 'commander';
import { TaskRouter } from '../services/task-router.js';
import { registry } from './agents.js';
import { formatOutput, formatError } from '../utils/output.js';

const router = new TaskRouter(registry);

interface CrossBizPattern {
  test: RegExp;
  steps: Array<{ target: string; command: string; extractArgs?: (task: string) => Record<string, unknown> }>;
  describe: string;
}

const CROSS_BIZ_PATTERNS: CrossBizPattern[] = [
  {
    test: /builderbee.*client.*aob|aob.*builderbee.*client|client.*enroll|client.*student/i,
    steps: [
      { target: 'builderbee', command: 'clients.list' },
      { target: 'aob', command: 'students.list' },
    ],
    describe: 'Cross-query: fetch BuilderBee clients and AOB students, then correlate by email',
  },
  {
    test: /student.*payment.*community|full.*profile|360.*view/i,
    steps: [
      { target: 'aob', command: 'students.list' },
      { target: 'aob', command: 'payments.list' },
      { target: 'aob', command: 'community.members' },
    ],
    describe: 'Full student profile: CRM + payment history + community activity',
  },
  {
    test: /pipeline.*report|full.*status|system.*overview/i,
    steps: [
      { target: 'centaurion', command: 'pipeline.health' },
      { target: 'centaurion', command: 'agents.health' },
      { target: 'centaurion', command: 'config.check' },
    ],
    describe: 'Full pipeline report: health + agents + config validation',
  },
];

async function executeStep(routerUrl: string, apiKey: string, target: string, command: string, args: Record<string, unknown> = {}): Promise<unknown> {
  const response = await fetch(`${routerUrl}/route`, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, command, args }),
  });
  return response.json();
}

export function createDoCommand(): Command {
  const doCmd = new Command('do').description('Cross-business orchestration — route a natural language task');

  doCmd
    .argument('<task>', 'Natural language task')
    .option('--execute', 'Execute via the UAPP router (requires UAPP_API_KEY)')
    .option('--json', 'Output as JSON')
    .action(async (task: string, opts) => {
      try {
        // Check for cross-business patterns first
        const crossBiz = CROSS_BIZ_PATTERNS.find((p) => p.test.test(task));

        if (crossBiz) {
          const plan = {
            task,
            type: 'cross-business',
            description: crossBiz.describe,
            steps: crossBiz.steps.map((s, i) => ({
              step: i + 1,
              target: s.target,
              command: s.command,
            })),
          };

          if (!opts.execute) {
            console.log(formatOutput({ ...plan, hint: 'Pass --execute to run all steps via the UAPP router' }, { json: opts.json }));
            return;
          }

          const routerUrl = process.env.UAPP_ROUTER_URL ?? 'http://localhost:3100';
          const apiKey = process.env.UAPP_API_KEY;
          if (!apiKey) {
            console.error(formatError('MISSING_API_KEY', 'UAPP_API_KEY required for --execute', { json: opts.json }));
            process.exitCode = 1;
            return;
          }

          const results = await Promise.all(
            crossBiz.steps.map((step) => executeStep(routerUrl, apiKey, step.target, step.command, step.extractArgs?.(task) ?? {}))
          );

          console.log(formatOutput({
            task, type: 'cross-business',
            description: crossBiz.describe,
            results: crossBiz.steps.map((s, i) => ({ target: s.target, command: s.command, data: results[i] })),
          }, { json: opts.json }));
          return;
        }

        // Single-target routing
        const decision = router.route(task);

        if (decision.confidence === 0) {
          console.error(formatError('NO_ROUTE', `Cannot route: "${task}". ${decision.reasoning}`, { json: opts.json }));
          process.exitCode = 1;
          return;
        }

        if (!opts.execute) {
          console.log(formatOutput({
            task, type: 'single-target',
            target: decision.target, command: decision.command,
            confidence: decision.confidence, reasoning: decision.reasoning,
            hint: 'Pass --execute to run this via the UAPP router',
          }, { json: opts.json }));
          return;
        }

        const routerUrl = process.env.UAPP_ROUTER_URL ?? 'http://localhost:3100';
        const apiKey = process.env.UAPP_API_KEY;
        if (!apiKey) {
          console.error(formatError('MISSING_API_KEY', 'UAPP_API_KEY required for --execute', { json: opts.json }));
          process.exitCode = 1;
          return;
        }

        const result = await executeStep(routerUrl, apiKey, decision.target, decision.command, decision.args);
        console.log(formatOutput(result, { json: opts.json }));
      } catch (err) {
        console.error(formatError('DO_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return doCmd;
}
