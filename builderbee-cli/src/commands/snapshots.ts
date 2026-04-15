import { Command } from 'commander';
import { GHLAdapter } from '../adapters/ghl.js';
import { loadConfig } from '../utils/config.js';
import { formatOutput, formatError } from '../utils/output.js';

export function createSnapshotsCommand(): Command {
  const snapshots = new Command('snapshots').description('Manage GHL snapshots');

  snapshots
    .command('list')
    .description('List available snapshots')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const adapter = new GHLAdapter(loadConfig());
        const results = await adapter.listSnapshots();
        console.log(formatOutput(results, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('SNAPSHOTS_LIST_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  snapshots
    .command('deploy')
    .description('Deploy a snapshot to a location')
    .requiredOption('--snapshot <id>', 'Snapshot ID')
    .requiredOption('--location <id>', 'Target location ID')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const adapter = new GHLAdapter(loadConfig());
        const result = await adapter.deploySnapshot(opts.snapshot, opts.location);
        console.log(formatOutput(result, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('SNAPSHOT_DEPLOY_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return snapshots;
}
