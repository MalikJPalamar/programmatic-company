import { Command } from 'commander';
import { GHLAdapter } from '../adapters/ghl.js';
import { loadConfig } from '../utils/config.js';
import { formatOutput, formatError } from '../utils/output.js';

export function createHealthCommand(): Command {
  const health = new Command('health').description('Client health scoring');

  health
    .command('check')
    .description('Calculate health score for a client')
    .argument('<clientId>', 'Client/location ID')
    .option('--json', 'Output as JSON')
    .action(async (clientId: string, opts) => {
      try {
        const adapter = new GHLAdapter(loadConfig());
        const score = await adapter.getHealthScore(clientId);
        console.log(formatOutput(score, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('HEALTH_CHECK_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return health;
}
