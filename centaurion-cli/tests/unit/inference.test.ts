import { describe, it, expect } from 'vitest';
import { InferenceEngine } from '../../src/services/inference-engine.js';

describe('InferenceEngine', () => {
  it('matches lead spike pattern', () => {
    const engine = new InferenceEngine();
    const result = engine.run({ signal: 'GHL lead spike for Acme' });

    expect(result.prediction).toContain('inbound interest');
    expect(result.action).toContain('nurture');
    expect(result.surprise).toBeLessThan(1);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('matches payment failure pattern', () => {
    const engine = new InferenceEngine();
    const result = engine.run({ signal: 'payment fail for student 1001' });

    expect(result.prediction).toContain('Churn risk');
    expect(result.action).toContain('retention');
  });

  it('matches certification completion', () => {
    const engine = new InferenceEngine();
    const result = engine.run({ signal: 'certification completed for Sarah in TT2' });

    expect(result.action).toContain('advanced program');
  });

  it('returns high surprise for unknown signals', () => {
    const engine = new InferenceEngine();
    const result = engine.run({ signal: 'solar flare detected' });

    expect(result.surprise).toBe(0.9);
    expect(result.confidence).toBe(0.1);
    expect(result.action).toContain('escalate');
  });

  it('surprise decreases with repeated similar signals', () => {
    const engine = new InferenceEngine();
    const first = engine.run({ signal: 'GHL lead spike for Acme' });
    const second = engine.run({ signal: 'GHL lead spike for Beta' });

    expect(second.surprise).toBeLessThan(first.surprise);
  });

  it('tracks inference history', () => {
    const engine = new InferenceEngine();
    engine.run({ signal: 'lead spike' });
    engine.run({ signal: 'payment fail' });

    const history = engine.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].signal).toBe('lead spike');
  });

  it('handles retreat sold out signal', () => {
    const engine = new InferenceEngine();
    const result = engine.run({ signal: 'retreat sold out at ASHA' });

    expect(result.prediction).toContain('Demand exceeds supply');
    expect(result.action).toContain('price');
  });

  it('handles workflow error signal', () => {
    const engine = new InferenceEngine();
    const result = engine.run({ signal: 'workflow error in onboarding sequence' });

    expect(result.surprise).toBeGreaterThan(0.5);
    expect(result.action).toContain('investigate');
  });
});
