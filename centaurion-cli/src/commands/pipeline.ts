import { Command } from 'commander';
import { registry } from './agents.js';
import { formatOutput, formatError } from '../utils/output.js';

export function createPipelineCommand(): Command {
  const pipeline = new Command('pipeline').description('Pipeline health and operations');

  pipeline
    .command('health')
    .description('Full pipeline health report across all targets')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      const agents = registry.list();
      const health = {
        status: agents.every((a) => a.status === 'active') ? 'green' : agents.some((a) => a.status === 'active') ? 'yellow' : 'red',
        timestamp: new Date().toISOString(),
        targets: agents.map((a) => ({
          id: a.id,
          name: a.name,
          status: a.status,
          commands: a.commands.length,
        })),
        totalCommands: agents.reduce((sum, a) => sum + a.commands.length, 0),
        activeTargets: agents.filter((a) => a.status === 'active').length,
        totalTargets: agents.length,
      };
      console.log(formatOutput(health, { json: opts.json }));
    });

  pipeline
    .command('status')
    .description('Quick status summary')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      const agents = registry.list();
      const summary = {
        pipeline: 'UAPP',
        version: '0.1.0',
        uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'N/A',
        targets: Object.fromEntries(agents.map((a) => [a.id, { status: a.status, commands: a.commands.length }])),
      };
      console.log(formatOutput(summary, { json: opts.json }));
    });

  return pipeline;
}
