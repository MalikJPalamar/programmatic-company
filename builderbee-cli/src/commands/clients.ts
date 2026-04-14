import { Command } from 'commander';
import { GHLAdapter } from '../adapters/ghl.js';
import { loadConfig } from '../utils/config.js';
import { formatOutput, formatError } from '../utils/output.js';

export function createClientsCommand(): Command {
  const clients = new Command('clients').description('Manage GHL sub-accounts (clients)');

  clients
    .command('list')
    .description('List all client sub-accounts')
    .option('--status <status>', 'Filter by status (active, inactive, suspended)')
    .option('--limit <n>', 'Number of results', '20')
    .option('--offset <n>', 'Skip N results', '0')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const adapter = new GHLAdapter(loadConfig());
        const result = await adapter.listClients({
          status: opts.status,
          limit: parseInt(opts.limit, 10),
          offset: parseInt(opts.offset, 10),
        });
        console.log(formatOutput(opts.json ? result : result.items, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('CLIENTS_LIST_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  clients
    .command('get')
    .description('Get a specific client by ID')
    .argument('<id>', 'Client/location ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts) => {
      try {
        const adapter = new GHLAdapter(loadConfig());
        const client = await adapter.getClient(id);
        console.log(formatOutput(client, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('CLIENT_GET_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return clients;
}
