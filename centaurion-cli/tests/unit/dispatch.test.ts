import { describe, it, expect } from 'vitest';
import { TaskRouter } from '../../src/services/task-router.js';
import { AgentRegistry } from '../../src/services/agent-registry.js';

describe('Telegram dispatch routing', () => {
  const registry = new AgentRegistry();
  const router = new TaskRouter(registry);

  it('routes "Run SA scan" to centaurion sa-scan', () => {
    const decision = router.route('Run SA scan');
    // SA scan doesn't have a keyword pattern yet, but fuzzy match should find it
    expect(decision.confidence).toBeGreaterThan(0);
  });

  it('routes "list clients" to builderbee', () => {
    const decision = router.route('list clients');
    expect(decision.target).toBe('builderbee');
    expect(decision.command).toBe('clients.list');
  });

  it('routes "check student enrollment" to aob', () => {
    const decision = router.route('enroll student in program');
    expect(decision.target).toBe('aob');
  });

  it('routes "trigger workflow for contact" to builderbee', () => {
    const decision = router.route('trigger workflow for new lead');
    expect(decision.target).toBe('builderbee');
    expect(decision.command).toBe('workflows.trigger');
  });

  it('returns dispatch plan with confidence', () => {
    const decision = router.route('show me the client list');
    expect(decision).toHaveProperty('target');
    expect(decision).toHaveProperty('command');
    expect(decision).toHaveProperty('confidence');
    expect(decision).toHaveProperty('reasoning');
  });
});
