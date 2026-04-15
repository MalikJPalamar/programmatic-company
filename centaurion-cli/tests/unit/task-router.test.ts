import { describe, it, expect } from 'vitest';
import { TaskRouter } from '../../src/services/task-router.js';
import { AgentRegistry } from '../../src/services/agent-registry.js';

describe('TaskRouter', () => {
  const registry = new AgentRegistry();
  const router = new TaskRouter(registry);

  it('routes "list clients" to builderbee', () => {
    const decision = router.route('list clients');
    expect(decision.target).toBe('builderbee');
    expect(decision.command).toBe('clients.list');
    expect(decision.confidence).toBeGreaterThan(0.5);
  });

  it('routes "check certification" to aob', () => {
    const decision = router.route('check certification for student');
    expect(decision.target).toBe('aob');
    expect(decision.command).toBe('certifications.check');
  });

  it('routes "student info" to aob students', () => {
    const decision = router.route('get student info');
    expect(decision.target).toBe('aob');
    expect(decision.command).toBe('students.get');
  });

  it('routes "deploy snapshot" to builderbee', () => {
    const decision = router.route('deploy snapshot to client');
    expect(decision.target).toBe('builderbee');
    expect(decision.command).toBe('snapshots.deploy');
  });

  it('routes "payment status" to aob payments', () => {
    const decision = router.route('check payment status');
    expect(decision.target).toBe('aob');
    expect(decision.command).toBe('payments.status');
  });

  it('returns confidence 0 for unrecognized tasks', () => {
    const decision = router.route('xyzzy plugh nothing');
    expect(decision.confidence).toBe(0);
    expect(decision.target).toBe('');
  });

  it('handles case insensitivity', () => {
    const decision = router.route('LIST CLIENTS');
    expect(decision.target).toBe('builderbee');
  });

  it('uses fuzzy matching as fallback', () => {
    const decision = router.route('workflows');
    expect(decision.target).toBe('builderbee');
    expect(decision.confidence).toBe(0.5);
  });
});
