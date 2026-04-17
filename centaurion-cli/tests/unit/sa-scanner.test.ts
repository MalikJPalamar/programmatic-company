import { describe, it, expect } from 'vitest';
import { SAScanner, MockDataSource } from '../../src/services/sa-scanner.js';

describe('SAScanner', () => {
  function buildScanner() {
    const scanner = new SAScanner();
    scanner.registerSource(new MockDataSource());
    return scanner;
  }

  it('scans a single ticker with composite score', async () => {
    const scanner = buildScanner();
    const result = await scanner.scanTicker('SPY');

    expect(result.ticker).toBe('SPY');
    expect(result.signals.length).toBeGreaterThan(0);
    expect(typeof result.compositeScore).toBe('number');
    expect(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']).toContain(result.recommendation);
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('produces different scores for different tickers', async () => {
    const scanner = buildScanner();
    const spy = await scanner.scanTicker('SPY');
    const qqq = await scanner.scanTicker('QQQ');

    expect(spy.compositeScore).not.toBe(qqq.compositeScore);
  });

  it('scans multiple tickers and produces a report', async () => {
    const scanner = buildScanner();
    const report = await scanner.scanAll(['SPY', 'QQQ', 'IWM']);

    expect(report.tickers).toHaveLength(3);
    expect(report.summary).toContain('3 tickers');
    expect(report.generatedAt).toBeDefined();
  });

  it('returns hold (50) when no sources registered', async () => {
    const scanner = new SAScanner();
    const result = await scanner.scanTicker('SPY');

    expect(result.compositeScore).toBe(50);
    expect(result.signals).toHaveLength(0);
  });

  it('signals include source, indicator, value, weight, interpretation', async () => {
    const scanner = buildScanner();
    const result = await scanner.scanTicker('AAPL');
    const signal = result.signals[0];

    expect(signal.source).toBe('mock');
    expect(typeof signal.indicator).toBe('string');
    expect(typeof signal.value).toBe('number');
    expect(typeof signal.weight).toBe('number');
    expect(typeof signal.interpretation).toBe('string');
  });
});
