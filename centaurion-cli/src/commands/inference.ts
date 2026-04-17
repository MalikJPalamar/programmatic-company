import { Command } from 'commander';
import { InferenceEngine } from '../services/inference-engine.js';
import { formatOutput, formatError } from '../utils/output.js';

const engine = new InferenceEngine();

export function createInferenceCommand(): Command {
  const inference = new Command('inference').description('Active inference loop (FEP-based prediction)');

  inference
    .command('run')
    .description('Run inference on a business signal')
    .argument('<signal>', 'Signal description (e.g. "GHL lead spike for Acme")')
    .option('--json', 'Output as JSON')
    .action((signal: string, opts) => {
      try {
        const result = engine.run({ signal });
        console.log(formatOutput(result, { json: opts.json }));
      } catch (err) {
        console.error(formatError('INFERENCE_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  inference
    .command('history')
    .description('Show inference history')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      const history = engine.getHistory();
      console.log(formatOutput(history, { json: opts.json }));
    });

  return inference;
}
