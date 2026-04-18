import { describe, it, expect } from 'vitest';
import { AgentRegistry } from '../../src/services/agent-registry.js';

describe('Pipeline health', () => {
  it('reports green when all agents active', () => {
    const reg = new AgentRegistry();
    const agents = reg.list();
    const allActive = agents.every((a) => a.status === 'active');
    expect(allActive).toBe(true);
  });

  it('counts total commands across all agents', () => {
    const reg = new AgentRegistry();
    const total = reg.list().reduce((sum, a) => sum + a.commands.length, 0);
    expect(total).toBeGreaterThan(30);
  });

  it('detects degraded state when agent is inactive', () => {
    const reg = new AgentRegistry();
    reg.register({ id: 'broken', name: 'Broken', target: 'broken', description: 'Test', commands: ['x'], status: 'inactive' });
    const agents = reg.list();
    const allActive = agents.every((a) => a.status === 'active');
    expect(allActive).toBe(false);
  });
});
