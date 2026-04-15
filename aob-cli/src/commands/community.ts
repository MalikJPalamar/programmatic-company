import { Command } from 'commander';
import { MightyNetworksAdapter } from '../adapters/mighty.js';
import { loadConfig } from '../utils/config.js';
import { formatOutput, formatError } from '../utils/output.js';

export function createCommunityCommand(): Command {
  const community = new Command('community').description('Community management (Mighty Networks)');

  community
    .command('members')
    .description('List community members')
    .option('--group <name>', 'Filter by group/space')
    .option('--limit <n>', 'Number of results', '20')
    .option('--offset <n>', 'Skip N results', '0')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const config = loadConfig();
        if (!config.mighty) throw new Error('MIGHTY_API_KEY and MIGHTY_COMMUNITY_ID required');
        const adapter = new MightyNetworksAdapter(config.mighty);
        const result = await adapter.listMembers({
          group: opts.group, limit: parseInt(opts.limit, 10), offset: parseInt(opts.offset, 10),
        });
        console.log(formatOutput(opts.json ? result : result.items, { json: opts.json }));
      } catch (err) {
        console.error(formatError('COMMUNITY_MEMBERS_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  community
    .command('lookup')
    .description('Look up a community member by email')
    .argument('<email>', 'Member email')
    .option('--json', 'Output as JSON')
    .action(async (email: string, opts) => {
      try {
        const config = loadConfig();
        if (!config.mighty) throw new Error('MIGHTY_API_KEY and MIGHTY_COMMUNITY_ID required');
        const adapter = new MightyNetworksAdapter(config.mighty);
        const member = await adapter.getMember(email);
        if (!member) {
          console.log(formatOutput({ found: false, email }, { json: opts.json }));
        } else {
          console.log(formatOutput(member, { json: opts.json }));
        }
      } catch (err) {
        console.error(formatError('COMMUNITY_LOOKUP_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return community;
}
