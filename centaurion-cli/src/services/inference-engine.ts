import type { InferenceInput, InferenceResult } from '../types.js';

interface KnownPattern {
  signal: RegExp;
  prediction: string;
  action: string;
  baseSurprise: number;
}

const PATTERNS: KnownPattern[] = [
  { signal: /lead spike/i, prediction: 'Increased inbound interest, likely from recent campaign', action: 'trigger nurture sequence', baseSurprise: 0.3 },
  { signal: /payment fail/i, prediction: 'Churn risk — customer may downgrade or cancel', action: 'send retention offer + personal outreach', baseSurprise: 0.5 },
  { signal: /enrollment surge/i, prediction: 'Program capacity may be reached, waitlist needed', action: 'check capacity and open waitlist', baseSurprise: 0.4 },
  { signal: /community drop/i, prediction: 'Engagement decline signals disengagement risk', action: 'launch re-engagement campaign', baseSurprise: 0.6 },
  { signal: /certification complet/i, prediction: 'Student ready for advanced program upsell', action: 'send advanced program invitation', baseSurprise: 0.2 },
  { signal: /retreat (sold out|full)/i, prediction: 'Demand exceeds supply — pricing power exists', action: 'open additional dates or raise price for next', baseSurprise: 0.3 },
  { signal: /client churn/i, prediction: 'Revenue loss imminent, root cause investigation needed', action: 'schedule account review, prepare win-back offer', baseSurprise: 0.7 },
  { signal: /workflow error/i, prediction: 'Automation failure affecting customer experience', action: 'investigate and fix workflow, notify affected contacts', baseSurprise: 0.8 },
];

export class InferenceEngine {
  private history: Array<{ signal: string; result: InferenceResult; timestamp: string }> = [];

  run(input: InferenceInput): InferenceResult {
    for (const pattern of PATTERNS) {
      if (pattern.signal.test(input.signal)) {
        const surprise = this.adjustSurprise(pattern.baseSurprise, input.signal);
        const result: InferenceResult = {
          prediction: pattern.prediction,
          surprise,
          action: pattern.action,
          confidence: 1 - surprise,
          reasoning: `Matched pattern: ${pattern.signal.source}. FEP surprise=${surprise.toFixed(2)}.`,
        };

        this.history.push({ signal: input.signal, result, timestamp: new Date().toISOString() });
        return result;
      }
    }

    // Unknown signal — high surprise
    const result: InferenceResult = {
      prediction: 'Unknown signal — requires manual analysis',
      surprise: 0.9,
      action: 'escalate to human for review',
      confidence: 0.1,
      reasoning: `No known pattern matches "${input.signal}". High surprise = high information value.`,
    };

    this.history.push({ signal: input.signal, result, timestamp: new Date().toISOString() });
    return result;
  }

  getHistory(): Array<{ signal: string; result: InferenceResult; timestamp: string }> {
    return [...this.history];
  }

  // Surprise decreases when we've seen similar signals before (predictive order)
  private adjustSurprise(base: number, signal: string): number {
    const similar = this.history.filter((h) =>
      h.signal.toLowerCase().includes(signal.toLowerCase().split(' ')[0])
    ).length;
    return Math.max(0.05, base - similar * 0.1);
  }
}
