import { describe, it, expect } from 'vitest';
import { AgentRegistry } from '../../src/services/agent-registry.js';

describe('AgentRegistry', () => {
  it('lists builtin agents', () => {
    const reg = new AgentRegistry();
    const agents = reg.list();
    expect(agents.length).toBeGreaterThanOrEqual(2);
    expect(agents.find((a) => a.id === 'builderbee')).toBeDefined();
    expect(agents.find((a) => a.id === 'aob')).toBeDefined();
  });

  it('gets agent by id', () => {
    const reg = new AgentRegistry();
    const bb = reg.get('builderbee');
    expect(bb).toBeDefined();
    expect(bb!.name).toBe('BuilderBee');
    expect(bb!.commands.length).toBeGreaterThan(0);
  });

  it('returns undefined for unknown agent', () => {
    const reg = new AgentRegistry();
    expect(reg.get('nonexistent')).toBeUndefined();
  });

  it('registers a new agent', () => {
    const reg = new AgentRegistry();
    reg.register({ id: 'custom', name: 'Custom', target: 'custom', description: 'Test', commands: ['test.run'], status: 'active' });
    expect(reg.get('custom')).toBeDefined();
    expect(reg.list().length).toBeGreaterThanOrEqual(3);
  });

  it('reports health for all agents', () => {
    const reg = new AgentRegistry();
    const health = reg.health();
    expect(health.builderbee.status).toBe('active');
    expect(health.builderbee.commands).toBeGreaterThan(0);
    expect(health.aob.status).toBe('active');
  });

  it('finds agent by command', () => {
    const reg = new AgentRegistry();
    const agent = reg.findByCommand('clients.list');
    expect(agent).toBeDefined();
    expect(agent!.id).toBe('builderbee');

    const aobAgent = reg.findByCommand('students.get');
    expect(aobAgent!.id).toBe('aob');
  });
});
