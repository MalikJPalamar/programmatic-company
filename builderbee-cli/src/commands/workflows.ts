import { Command } from 'commander';
import { GHLAdapter } from '../adapters/ghl.js';
import { loadConfig } from '../utils/config.js';
import { formatOutput, formatError } from '../utils/output.js';

export function createWorkflowsCommand(): Command {
  const workflows = new Command('workflows').description('Manage GHL workflows');

  workflows
    .command('list')
    .description('List workflows for a location')
    .option('--location <id>', 'Location ID (defaults to GHL_LOCATION_ID env)')
    .option('--status <status>', 'Filter by status (active, inactive, draft)')
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
        let results = await adapter.listWorkflows(locationId);
        if (opts.status) {
          results = results.filter((w) => w.status === opts.status);
        }
        console.log(formatOutput(results, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('WORKFLOWS_LIST_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  workflows
    .command('trigger')
    .description('Trigger a workflow for a contact')
    .requiredOption('--workflow <id>', 'Workflow ID')
    .requiredOption('--contact <id>', 'Contact ID')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const adapter = new GHLAdapter(loadConfig());
        const result = await adapter.triggerWorkflow(opts.workflow, opts.contact);
        console.log(formatOutput(result, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('WORKFLOW_TRIGGER_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  workflows
    .command('pause')
    .description('Pause (deactivate) a workflow')
    .requiredOption('--workflow <id>', 'Workflow ID')
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
        const result = await adapter.pauseWorkflow(opts.workflow, locationId);
        console.log(formatOutput(result, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('WORKFLOW_PAUSE_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  workflows
    .command('status')
    .description('Get the status of a specific workflow')
    .requiredOption('--workflow <id>', 'Workflow ID')
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
        const workflow = await adapter.getWorkflowStatus(opts.workflow, locationId);
        console.log(formatOutput(workflow, { json: opts.json }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(formatError('WORKFLOW_STATUS_FAILED', msg, { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return workflows;
}
