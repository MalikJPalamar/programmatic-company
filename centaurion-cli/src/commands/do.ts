import { Command } from 'commander';
import { TaskRouter } from '../services/task-router.js';
import { registry } from './agents.js';
import { formatOutput, formatError } from '../utils/output.js';

const router = new TaskRouter(registry);

export function createDoCommand(): Command {
  const doCmd = new Command('do').description('Cross-business orchestration — route a natural language task');

  doCmd
    .argument('<task>', 'Natural language task (e.g. "Check if BuilderBee client Acme has AOB enrollments")')
    .option('--execute', 'Actually execute via the router (requires UAPP_API_KEY)')
    .option('--json', 'Output as JSON')
    .action(async (task: string, opts) => {
      try {
        const decision = router.route(task);

        if (decision.confidence === 0) {
          console.error(formatError('NO_ROUTE', `Cannot route: "${task}". ${decision.reasoning}`, { json: opts.json }));
          process.exitCode = 1;
          return;
        }

        if (!opts.execute) {
          const plan = {
            task,
            routed: true,
            target: decision.target,
            command: decision.command,
            confidence: decision.confidence,
            reasoning: decision.reasoning,
            hint: 'Pass --execute to run this via the UAPP router',
          };
          console.log(formatOutput(plan, { json: opts.json }));
          return;
        }

        // Execute via UAPP router
        const routerUrl = process.env.UAPP_ROUTER_URL ?? 'http://localhost:3100';
        const apiKey = process.env.UAPP_API_KEY;
        if (!apiKey) {
          console.error(formatError('MISSING_API_KEY', 'UAPP_API_KEY required for --execute', { json: opts.json }));
          process.exitCode = 1;
          return;
        }

        const response = await fetch(`${routerUrl}/route`, {
          method: 'POST',
          headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: decision.target, command: decision.command, args: decision.args }),
        });

        const result = await response.json();
        console.log(formatOutput(result, { json: opts.json }));
      } catch (err) {
        console.error(formatError('DO_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return doCmd;
}
