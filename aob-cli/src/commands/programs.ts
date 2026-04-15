import { Command } from 'commander';
import { OntraportProgramAdapter } from '../adapters/programs.js';
import { loadConfig } from '../utils/config.js';
import { formatOutput, formatError } from '../utils/output.js';

function buildAdapter() {
  const config = loadConfig();
  if (!config.ontraport) throw new Error('ONTRAPORT_API_KEY and ONTRAPORT_APP_ID required');
  return new OntraportProgramAdapter(config.ontraport);
}

export function createProgramsCommand(): Command {
  const programs = new Command('programs').description('Program management');

  programs
    .command('list')
    .description('List all programs')
    .option('--status <status>', 'Filter by status (active, inactive, archived)')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const results = await buildAdapter().listPrograms({ status: opts.status });
        console.log(formatOutput(results, { json: opts.json }));
      } catch (err) {
        console.error(formatError('PROGRAMS_LIST_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  programs
    .command('get')
    .description('Get a specific program')
    .argument('<id>', 'Program ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts) => {
      try {
        const program = await buildAdapter().getProgram(id);
        console.log(formatOutput(program, { json: opts.json }));
      } catch (err) {
        console.error(formatError('PROGRAM_GET_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return programs;
}

export function createCohortsCommand(): Command {
  const cohorts = new Command('cohorts').description('Cohort management');

  cohorts
    .command('list')
    .description('List cohorts for a program')
    .requiredOption('--program <id>', 'Program ID')
    .option('--status <status>', 'Filter by status (active, upcoming, completed)')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const results = await buildAdapter().listCohorts(opts.program, { status: opts.status });
        console.log(formatOutput(results, { json: opts.json }));
      } catch (err) {
        console.error(formatError('COHORTS_LIST_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  cohorts
    .command('get')
    .description('Get a specific cohort')
    .requiredOption('--program <id>', 'Program ID')
    .argument('<cohortId>', 'Cohort ID')
    .option('--json', 'Output as JSON')
    .action(async (cohortId: string, opts) => {
      try {
        const cohort = await buildAdapter().getCohort(opts.program, cohortId);
        console.log(formatOutput(cohort, { json: opts.json }));
      } catch (err) {
        console.error(formatError('COHORT_GET_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return cohorts;
}

export function createCertificationsCommand(): Command {
  const certs = new Command('certifications').description('Certification management');

  certs
    .command('check')
    .description('Check if a student has certification for a program')
    .requiredOption('--student <id>', 'Student ID')
    .requiredOption('--program <id>', 'Program ID')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const cert = await buildAdapter().checkCertification(opts.student, opts.program);
        if (cert) {
          console.log(formatOutput(cert, { json: opts.json }));
        } else {
          const result = { certified: false, studentId: opts.student, programId: opts.program };
          console.log(formatOutput(result, { json: opts.json }));
        }
      } catch (err) {
        console.error(formatError('CERT_CHECK_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  certs
    .command('issue')
    .description('Issue a certification to a student')
    .requiredOption('--student <id>', 'Student ID')
    .requiredOption('--program <id>', 'Program ID')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const cert = await buildAdapter().issueCertification(opts.student, opts.program);
        console.log(formatOutput(cert, { json: opts.json }));
      } catch (err) {
        console.error(formatError('CERT_ISSUE_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  certs
    .command('list')
    .description('List all certifications for a student')
    .requiredOption('--student <id>', 'Student ID')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const results = await buildAdapter().listCertifications(opts.student);
        console.log(formatOutput(results, { json: opts.json }));
      } catch (err) {
        console.error(formatError('CERTS_LIST_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return certs;
}
