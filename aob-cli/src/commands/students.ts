import { Command } from 'commander';
import { OntraportAdapter } from '../adapters/ontraport.js';
import { StripeAdapter } from '../adapters/stripe.js';
import { MightyNetworksAdapter } from '../adapters/mighty.js';
import { StudentFusionService } from '../services/student-fusion.js';
import { loadConfig } from '../utils/config.js';
import { formatOutput, formatError } from '../utils/output.js';
import type { CRMAdapter, PaymentAdapter, CommunityAdapter } from '../types.js';

function buildFusionService(): StudentFusionService {
  const config = loadConfig();

  if (!config.ontraport) {
    throw new Error('ONTRAPORT_API_KEY and ONTRAPORT_APP_ID required');
  }

  const crm: CRMAdapter = new OntraportAdapter(config.ontraport);

  const payment: PaymentAdapter = config.stripe
    ? new StripeAdapter(config.stripe)
    : { getCustomer: async () => ({ id: '', email: '', name: '' }), listPayments: async () => [], getPaymentStatus: async () => 'none' as const };

  const community: CommunityAdapter = config.mighty
    ? new MightyNetworksAdapter(config.mighty)
    : { getMember: async () => null, listMembers: async () => ({ items: [], total: 0, page: 1, pageSize: 20, hasMore: false }), isActive: async () => false };

  return new StudentFusionService(crm, payment, community);
}

export function createStudentsCommand(): Command {
  const students = new Command('students').description('Unified student management (CRM + Stripe + Mighty)');

  students
    .command('list')
    .description('List students with fused data from all systems')
    .option('--program <slug>', 'Filter by program enrollment')
    .option('--limit <n>', 'Number of results', '20')
    .option('--offset <n>', 'Skip N results', '0')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const service = buildFusionService();
        const result = await service.listStudents({
          program: opts.program,
          limit: parseInt(opts.limit, 10),
          offset: parseInt(opts.offset, 10),
        });
        console.log(formatOutput(opts.json ? result : result.items, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('STUDENTS_LIST_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  students
    .command('get')
    .description('Get a single student with fused data')
    .argument('<id>', 'Student/contact ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts) => {
      try {
        const service = buildFusionService();
        const student = await service.getStudent(id);
        console.log(formatOutput(student, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('STUDENT_GET_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  students
    .command('search')
    .description('Search students across all systems')
    .argument('<query>', 'Search query')
    .option('--json', 'Output as JSON')
    .action(async (query: string, opts) => {
      try {
        const service = buildFusionService();
        const results = await service.searchStudents(query);
        console.log(formatOutput(results, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('STUDENTS_SEARCH_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return students;
}
