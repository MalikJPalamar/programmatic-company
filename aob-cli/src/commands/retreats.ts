import { Command } from 'commander';
import { RetreatGuruAdapter } from '../adapters/retreats.js';
import { formatOutput, formatError } from '../utils/output.js';

function buildAdapter() {
  const apiKey = process.env.RETREATGURU_API_KEY;
  if (!apiKey) throw new Error('RETREATGURU_API_KEY environment variable required');
  return new RetreatGuruAdapter({ apiKey, baseUrl: process.env.RETREATGURU_BASE_URL });
}

export function createRetreatsCommand(): Command {
  const retreats = new Command('retreats').description('Retreat & booking management (RetreatGuru)');

  retreats
    .command('list')
    .description('List retreats')
    .option('--location <location>', 'Filter by location (e.g. asha)')
    .option('--upcoming', 'Show only upcoming retreats')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const results = await buildAdapter().listRetreats({ location: opts.location, upcoming: opts.upcoming });
        console.log(formatOutput(results, { json: opts.json }));
      } catch (err) {
        console.error(formatError('RETREATS_LIST_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  retreats
    .command('get')
    .description('Get retreat details')
    .argument('<id>', 'Retreat ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts) => {
      try {
        const retreat = await buildAdapter().getRetreat(id);
        console.log(formatOutput(retreat, { json: opts.json }));
      } catch (err) {
        console.error(formatError('RETREAT_GET_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  retreats
    .command('availability')
    .description('Check availability for a retreat')
    .argument('<id>', 'Retreat ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts) => {
      try {
        const result = await buildAdapter().checkAvailability(id);
        console.log(formatOutput(result, { json: opts.json }));
      } catch (err) {
        console.error(formatError('RETREAT_AVAILABILITY_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  retreats
    .command('bookings')
    .description('List bookings for a retreat')
    .argument('<retreatId>', 'Retreat ID')
    .option('--json', 'Output as JSON')
    .action(async (retreatId: string, opts) => {
      try {
        const bookings = await buildAdapter().listBookings(retreatId);
        console.log(formatOutput(bookings, { json: opts.json }));
      } catch (err) {
        console.error(formatError('BOOKINGS_LIST_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  retreats
    .command('book')
    .description('Create a booking for a retreat')
    .requiredOption('--retreat <id>', 'Retreat ID')
    .requiredOption('--name <name>', 'Guest full name')
    .requiredOption('--email <email>', 'Guest email')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const booking = await buildAdapter().createBooking(opts.retreat, { name: opts.name, email: opts.email });
        console.log(formatOutput(booking, { json: opts.json }));
      } catch (err) {
        console.error(formatError('BOOKING_CREATE_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  retreats
    .command('booking')
    .description('Get a specific booking')
    .argument('<id>', 'Booking ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts) => {
      try {
        const booking = await buildAdapter().getBooking(id);
        console.log(formatOutput(booking, { json: opts.json }));
      } catch (err) {
        console.error(formatError('BOOKING_GET_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return retreats;
}
