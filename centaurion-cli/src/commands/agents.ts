import { Command } from 'commander';
import { AgentRegistry } from '../services/agent-registry.js';
import { formatOutput, formatError } from '../utils/output.js';

const registry = new AgentRegistry();

export function createAgentsCommand(): Command {
  const agents = new Command('agents').description('Agent registry management');

  agents
    .command('list')
    .description('List all registered agents')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      console.log(formatOutput(registry.list(), { json: opts.json }));
    });

  agents
    .command('health')
    .description('Check health of all agents')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      console.log(formatOutput(registry.health(), { json: opts.json }));
    });

  agents
    .command('get')
    .description('Get details of a specific agent')
    .argument('<id>', 'Agent ID')
    .option('--json', 'Output as JSON')
    .action((id: string, opts) => {
      const agent = registry.get(id);
      if (!agent) {
        console.error(formatError('AGENT_NOT_FOUND', `Agent "${id}" not found`, { json: opts.json }));
        process.exitCode = 1;
        return;
      }
      console.log(formatOutput(agent, { json: opts.json }));
    });

  return agents;
}

export { registry };
