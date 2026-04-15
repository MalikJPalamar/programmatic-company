import { Command } from 'commander';
import { OntraportAdapter } from '../adapters/ontraport.js';
import { loadConfig } from '../utils/config.js';
import { formatOutput, formatError } from '../utils/output.js';

export function createContactsCommand(): Command {
  const contacts = new Command('contacts').description('CRM contact management (Ontraport)');

  contacts
    .command('list')
    .description('List contacts from CRM')
    .option('--tag <tag>', 'Filter by tag')
    .option('--limit <n>', 'Number of results', '20')
    .option('--offset <n>', 'Skip N results', '0')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const config = loadConfig();
        if (!config.ontraport) throw new Error('ONTRAPORT_API_KEY and ONTRAPORT_APP_ID required');
        const adapter = new OntraportAdapter(config.ontraport);
        const result = await adapter.listContacts({
          tag: opts.tag, limit: parseInt(opts.limit, 10), offset: parseInt(opts.offset, 10),
        });
        console.log(formatOutput(opts.json ? result : result.items, { json: opts.json }));
      } catch (err) {
        console.error(formatError('CONTACTS_LIST_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  contacts
    .command('get')
    .description('Get a contact by ID')
    .argument('<id>', 'Contact ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts) => {
      try {
        const config = loadConfig();
        if (!config.ontraport) throw new Error('ONTRAPORT_API_KEY and ONTRAPORT_APP_ID required');
        const adapter = new OntraportAdapter(config.ontraport);
        const contact = await adapter.getContact(id);
        console.log(formatOutput(contact, { json: opts.json }));
      } catch (err) {
        console.error(formatError('CONTACT_GET_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  contacts
    .command('search')
    .description('Search contacts')
    .argument('<query>', 'Search query')
    .option('--json', 'Output as JSON')
    .action(async (query: string, opts) => {
      try {
        const config = loadConfig();
        if (!config.ontraport) throw new Error('ONTRAPORT_API_KEY and ONTRAPORT_APP_ID required');
        const adapter = new OntraportAdapter(config.ontraport);
        const results = await adapter.searchContacts(query);
        console.log(formatOutput(results, { json: opts.json }));
      } catch (err) {
        console.error(formatError('CONTACTS_SEARCH_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  contacts
    .command('create')
    .description('Create a new contact')
    .requiredOption('--first-name <name>', 'First name')
    .requiredOption('--last-name <name>', 'Last name')
    .option('--email <email>', 'Email')
    .option('--phone <phone>', 'Phone')
    .option('--tags <tags>', 'Comma-separated tags')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const config = loadConfig();
        if (!config.ontraport) throw new Error('ONTRAPORT_API_KEY and ONTRAPORT_APP_ID required');
        const adapter = new OntraportAdapter(config.ontraport);
        const contact = await adapter.createContact({
          firstName: opts.firstName, lastName: opts.lastName,
          email: opts.email, phone: opts.phone,
          tags: opts.tags?.split(',').map((t: string) => t.trim()),
        });
        console.log(formatOutput(contact, { json: opts.json }));
      } catch (err) {
        console.error(formatError('CONTACT_CREATE_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  contacts
    .command('update')
    .description('Update a contact')
    .argument('<id>', 'Contact ID')
    .option('--first-name <name>', 'New first name')
    .option('--last-name <name>', 'New last name')
    .option('--email <email>', 'New email')
    .option('--phone <phone>', 'New phone')
    .option('--tags <tags>', 'Comma-separated tags')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts) => {
      try {
        const config = loadConfig();
        if (!config.ontraport) throw new Error('ONTRAPORT_API_KEY and ONTRAPORT_APP_ID required');
        const adapter = new OntraportAdapter(config.ontraport);
        const update: Record<string, unknown> = {};
        if (opts.firstName) update.firstName = opts.firstName;
        if (opts.lastName) update.lastName = opts.lastName;
        if (opts.email) update.email = opts.email;
        if (opts.phone) update.phone = opts.phone;
        if (opts.tags) update.tags = opts.tags.split(',').map((t: string) => t.trim());
        const contact = await adapter.updateContact(id, update);
        console.log(formatOutput(contact, { json: opts.json }));
      } catch (err) {
        console.error(formatError('CONTACT_UPDATE_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return contacts;
}
