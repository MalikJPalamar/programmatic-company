import { Command } from 'commander';
import { TaskRouter } from '../services/task-router.js';
import { registry } from './agents.js';
import { formatOutput, formatError } from '../utils/output.js';

const router = new TaskRouter(registry);

export function createRouteCommand(): Command {
  const route = new Command('route').description('Route a natural language task to the correct CLI');

  route
    .command('task')
    .description('Route a task to the appropriate agent')
    .argument('<task>', 'Natural language task description')
    .option('--json', 'Output as JSON')
    .action((task: string, opts) => {
      const decision = router.route(task);
      if (decision.confidence === 0) {
        console.error(formatError('NO_ROUTE', decision.reasoning, { json: opts.json }));
        process.exitCode = 1;
        return;
      }
      console.log(formatOutput(decision, { json: opts.json }));
    });

  return route;
}
