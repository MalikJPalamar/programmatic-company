import { Command } from 'commander';
import { TaskRouter } from '../services/task-router.js';
import { registry } from './agents.js';
import { formatOutput, formatError } from '../utils/output.js';

const router = new TaskRouter(registry);

interface DispatchMessage {
  source: string;
  text: string;
  userId?: string;
  chatId?: string;
}

export function createDispatchCommand(): Command {
  const dispatch = new Command('dispatch').description('Message dispatch — route incoming messages to CLIs');

  dispatch
    .command('telegram')
    .description('Process a Telegram-style message and route to the correct CLI')
    .argument('<message>', 'Message text (e.g. "Run SA scan" or "List clients")')
    .option('--user <id>', 'User/chat ID for audit')
    .option('--execute', 'Execute via UAPP router (requires UAPP_API_KEY)')
    .option('--json', 'Output as JSON')
    .action(async (message: string, opts) => {
      try {
        const msg: DispatchMessage = {
          source: 'telegram',
          text: message,
          userId: opts.user,
        };

        const decision = router.route(msg.text);

        if (decision.confidence === 0) {
          const result = {
            dispatched: false,
            source: msg.source,
            message: msg.text,
            error: decision.reasoning,
            suggestion: 'Try being more specific, e.g. "list clients" or "check certification for student 1001"',
          };
          console.log(formatOutput(result, { json: opts.json }));
          return;
        }

        const result = {
          dispatched: true,
          source: msg.source,
          message: msg.text,
          routed: {
            target: decision.target,
            command: decision.command,
            confidence: decision.confidence,
            reasoning: decision.reasoning,
          },
        };

        if (opts.execute) {
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

          const apiResult = await response.json();
          console.log(formatOutput({ ...result, execution: apiResult }, { json: opts.json }));
        } else {
          console.log(formatOutput(result, { json: opts.json }));
        }
      } catch (err) {
        console.error(formatError('DISPATCH_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return dispatch;
}
