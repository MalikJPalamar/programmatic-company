import { Command } from 'commander';
import { SAScanner, MockDataSource } from '../services/sa-scanner.js';
import { formatOutput, formatError } from '../utils/output.js';

function buildScanner(): SAScanner {
  const scanner = new SAScanner();
  scanner.registerSource(new MockDataSource());
  return scanner;
}

export function createSAScanCommand(): Command {
  const saScan = new Command('sa-scan').description('Situational Awareness scanner');

  saScan
    .command('run')
    .description('Run SA scan on one or more tickers')
    .option('--tickers <list>', 'Comma-separated ticker symbols', 'SPY,QQQ,IWM')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const tickers = opts.tickers === 'all'
          ? ['SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'ARKK', 'XLF', 'XLE', 'XLK', 'GLD']
          : opts.tickers.split(',').map((t: string) => t.trim().toUpperCase());

        const scanner = buildScanner();
        const report = await scanner.scanAll(tickers);
        console.log(formatOutput(report, { json: opts.json }));
      } catch (err) {
        console.error(formatError('SA_SCAN_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  saScan
    .command('ticker')
    .description('Scan a single ticker')
    .argument('<symbol>', 'Ticker symbol')
    .option('--json', 'Output as JSON')
    .action(async (symbol: string, opts) => {
      try {
        const scanner = buildScanner();
        const result = await scanner.scanTicker(symbol.toUpperCase());
        console.log(formatOutput(result, { json: opts.json }));
      } catch (err) {
        console.error(formatError('SA_SCAN_TICKER_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  return saScan;
}
