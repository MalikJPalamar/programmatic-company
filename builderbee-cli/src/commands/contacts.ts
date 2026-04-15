import { Command } from 'commander';
import { GHLAdapter } from '../adapters/ghl.js';
import { loadConfig } from '../utils/config.js';
import { formatOutput, formatError } from '../utils/output.js';

export function createContactsCommand(): Command {
  const contacts = new Command('contacts').description('Manage GHL contacts');

  contacts
    .command('list')
    .description('List contacts for a location')
    .option('--location <id>', 'Location ID (defaults to GHL_LOCATION_ID env)')
    .option('--limit <n>', 'Number of results', '20')
    .option('--offset <n>', 'Skip N results', '0')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const config = loadConfig();
        const locationId = opts.location ?? config.locationId;
        if (!locationId) {
          console.error(
            formatError(
              'MISSING_LOCATION',
              'Provide --location or set GHL_LOCATION_ID env',
              { json: opts.json }
            )
          );
          process.exitCode = 1;
          return;
        }

        const adapter = new GHLAdapter(config);
        const result = await adapter.listContacts(locationId, {
          limit: parseInt(opts.limit, 10),
          offset: parseInt(opts.offset, 10),
        });
        console.log(formatOutput(opts.json ? result : result.items, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('CONTACTS_LIST_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  contacts
    .command('search')
    .description('Search contacts by query')
    .argument('<query>', 'Search query (name, email, phone)')
    .option('--location <id>', 'Location ID (defaults to GHL_LOCATION_ID env)')
    .option('--json', 'Output as JSON')
    .action(async (query: string, opts) => {
      try {
        const config = loadConfig();
        const locationId = opts.location ?? config.locationId;
        if (!locationId) {
          console.error(
            formatError(
              'MISSING_LOCATION',
              'Provide --location or set GHL_LOCATION_ID env',
              { json: opts.json }
            )
          );
          process.exitCode = 1;
          return;
        }

        const adapter = new GHLAdapter(config);
        const results = await adapter.searchContacts(locationId, query);
        console.log(formatOutput(results, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('CONTACTS_SEARCH_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  contacts
    .command('create')
    .description('Create a new contact')
    .requiredOption('--first-name <name>', 'First name')
    .requiredOption('--last-name <name>', 'Last name')
    .option('--email <email>', 'Email address')
    .option('--phone <phone>', 'Phone number')
    .option('--tags <tags>', 'Comma-separated tags')
    .option('--source <source>', 'Lead source')
    .option('--location <id>', 'Location ID (defaults to GHL_LOCATION_ID env)')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const config = loadConfig();
        const locationId = opts.location ?? config.locationId;
        if (!locationId) {
          console.error(
            formatError('MISSING_LOCATION', 'Provide --location or set GHL_LOCATION_ID env', { json: opts.json })
          );
          process.exitCode = 1;
          return;
        }

        const adapter = new GHLAdapter(config);
        const contact = await adapter.createContact({
          firstName: opts.firstName,
          lastName: opts.lastName,
          email: opts.email,
          phone: opts.phone,
          tags: opts.tags ? opts.tags.split(',').map((t: string) => t.trim()) : undefined,
          source: opts.source,
          locationId,
        });
        console.log(formatOutput(contact, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('CONTACT_CREATE_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  contacts
    .command('update')
    .description('Update an existing contact')
    .argument('<id>', 'Contact ID')
    .option('--first-name <name>', 'New first name')
    .option('--last-name <name>', 'New last name')
    .option('--email <email>', 'New email')
    .option('--phone <phone>', 'New phone')
    .option('--tags <tags>', 'Comma-separated tags (replaces existing)')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts) => {
      try {
        const adapter = new GHLAdapter(loadConfig());
        const update: Record<string, unknown> = {};
        if (opts.firstName) update.firstName = opts.firstName;
        if (opts.lastName) update.lastName = opts.lastName;
        if (opts.email) update.email = opts.email;
        if (opts.phone) update.phone = opts.phone;
        if (opts.tags) update.tags = opts.tags.split(',').map((t: string) => t.trim());

        const contact = await adapter.updateContact(id, update);
        console.log(formatOutput(contact, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('CONTACT_UPDATE_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return contacts;
}
