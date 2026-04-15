import { Command } from 'commander';
import { StripeAdapter } from '../adapters/stripe.js';
import { loadConfig } from '../utils/config.js';
import { formatOutput, formatError } from '../utils/output.js';

export function createPaymentsCommand(): Command {
  const payments = new Command('payments').description('Payment management (Stripe)');

  payments
    .command('list')
    .description('List payments for a customer')
    .requiredOption('--customer <id>', 'Stripe customer ID')
    .option('--limit <n>', 'Number of results', '20')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const config = loadConfig();
        if (!config.stripe) throw new Error('STRIPE_SECRET_KEY required');
        const adapter = new StripeAdapter(config.stripe);
        const results = await adapter.listPayments(opts.customer, { limit: parseInt(opts.limit, 10) });
        console.log(formatOutput(results, { json: opts.json }));
      } catch (err) {
        console.error(formatError('PAYMENTS_LIST_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  payments
    .command('status')
    .description('Get payment status for a customer')
    .requiredOption('--customer <id>', 'Stripe customer ID')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const config = loadConfig();
        if (!config.stripe) throw new Error('STRIPE_SECRET_KEY required');
        const adapter = new StripeAdapter(config.stripe);
        const status = await adapter.getPaymentStatus(opts.customer);
        console.log(formatOutput({ customerId: opts.customer, status }, { json: opts.json }));
      } catch (err) {
        console.error(formatError('PAYMENT_STATUS_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return payments;
}
