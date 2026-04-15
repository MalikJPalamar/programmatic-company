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

  clients
    .command('create')
    .description('Create a new client sub-account')
    .requiredOption('--name <name>', 'Client name')
    .requiredOption('--email <email>', 'Client email')
    .option('--phone <phone>', 'Client phone')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const adapter = new GHLAdapter(loadConfig());
        const client = await adapter.createClient({
          name: opts.name,
          email: opts.email,
          phone: opts.phone,
        });
        console.log(formatOutput(client, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('CLIENT_CREATE_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  clients
    .command('update')
    .description('Update a client sub-account')
    .argument('<id>', 'Client/location ID')
    .option('--name <name>', 'New client name')
    .option('--email <email>', 'New client email')
    .option('--phone <phone>', 'New client phone')
    .option('--status <status>', 'New status (active, inactive, suspended)')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts) => {
      try {
        const adapter = new GHLAdapter(loadConfig());
        const update: Record<string, string> = {};
        if (opts.name) update.name = opts.name;
        if (opts.email) update.email = opts.email;
        if (opts.phone) update.phone = opts.phone;
        if (opts.status) update.status = opts.status;

        const client = await adapter.updateClient(id, update);
        console.log(formatOutput(client, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('CLIENT_UPDATE_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  clients
    .command('delete')
    .description('Delete a client sub-account')
    .argument('<id>', 'Client/location ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts) => {
      try {
        const adapter = new GHLAdapter(loadConfig());
        const result = await adapter.deleteClient(id);
        console.log(formatOutput(result, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('CLIENT_DELETE_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return clients;
}
