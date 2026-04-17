import type { ScanResult, ScanReport, Signal } from '../types.js';

export interface SADataSource {
  name: string;
  fetchSignals(ticker: string): Promise<Signal[]>;
}

export class SAScanner {
  private sources: SADataSource[] = [];

  registerSource(source: SADataSource): void {
    this.sources.push(source);
  }

  async scanTicker(ticker: string): Promise<ScanResult> {
    const allSignals: Signal[] = [];

    for (const source of this.sources) {
      try {
        const signals = await source.fetchSignals(ticker);
        allSignals.push(...signals);
      } catch {
        allSignals.push({
          source: source.name,
          indicator: 'error',
          value: 0,
          weight: 0,
          interpretation: `Failed to fetch from ${source.name}`,
        });
      }
    }

    const compositeScore = this.calculateComposite(allSignals);

    return {
      ticker,
      date: new Date().toISOString().split('T')[0],
      signals: allSignals,
      compositeScore,
      recommendation: this.scoreToRecommendation(compositeScore),
    };
  }

  async scanAll(tickers: string[]): Promise<ScanReport> {
    const results = await Promise.all(tickers.map((t) => this.scanTicker(t)));

    const avgScore = results.reduce((sum, r) => sum + r.compositeScore, 0) / results.length;

    return {
      date: new Date().toISOString().split('T')[0],
      tickers: results,
      summary: `Scanned ${results.length} tickers. Average composite: ${avgScore.toFixed(1)}. ${results.filter((r) => r.recommendation === 'buy' || r.recommendation === 'strong_buy').length} buy signals.`,
      generatedAt: new Date().toISOString(),
    };
  }

  private calculateComposite(signals: Signal[]): number {
    const weighted = signals.filter((s) => s.weight > 0);
    if (weighted.length === 0) return 50;

    const totalWeight = weighted.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = weighted.reduce((sum, s) => sum + s.value * s.weight, 0);
    return Math.round((weightedSum / totalWeight) * 100) / 100;
  }

  private scoreToRecommendation(score: number): ScanResult['recommendation'] {
    if (score >= 80) return 'strong_buy';
    if (score >= 60) return 'buy';
    if (score >= 40) return 'hold';
    if (score >= 20) return 'sell';
    return 'strong_sell';
  }
}

// Built-in mock data source for testing
export class MockDataSource implements SADataSource {
  name = 'mock';

  async fetchSignals(ticker: string): Promise<Signal[]> {
    const seed = ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const momentum = ((seed * 7) % 100);
    const volume = ((seed * 13) % 100);
    const sentiment = ((seed * 17) % 100);

    return [
      { source: 'mock', indicator: 'momentum', value: momentum, weight: 0.4, interpretation: momentum > 50 ? 'Bullish momentum' : 'Bearish momentum' },
      { source: 'mock', indicator: 'volume', value: volume, weight: 0.3, interpretation: volume > 50 ? 'Above average volume' : 'Below average volume' },
      { source: 'mock', indicator: 'sentiment', value: sentiment, weight: 0.3, interpretation: sentiment > 50 ? 'Positive sentiment' : 'Negative sentiment' },
    ];
  }
}
