import type { Agent } from '../types.js';

const BUILTIN_AGENTS: Agent[] = [
  {
    id: 'builderbee',
    name: 'BuilderBee',
    target: 'builderbee',
    description: 'GHL API wrapper for web agency operations',
    commands: [
      'clients.list', 'clients.get', 'clients.create', 'clients.update', 'clients.delete',
      'contacts.list', 'contacts.search', 'contacts.create', 'contacts.update',
      'workflows.list', 'workflows.trigger', 'workflows.pause', 'workflows.status',
      'snapshots.list', 'snapshots.deploy', 'health.check',
    ],
    status: 'active',
  },
  {
    id: 'aob',
    name: 'AOB',
    target: 'aob',
    description: 'Unified CLI across Ontraport, Stripe, Mighty Networks',
    commands: [
      'students.list', 'students.get', 'students.search',
      'contacts.list', 'contacts.get', 'contacts.search', 'contacts.create', 'contacts.update',
      'payments.list', 'payments.status',
      'community.members', 'community.lookup',
      'programs.list', 'programs.get',
      'cohorts.list', 'cohorts.get',
      'certifications.check', 'certifications.issue', 'certifications.list',
    ],
    status: 'active',
  },
  {
    id: 'centaurion',
    name: 'Centaurion',
    target: 'centaurion',
    description: 'Meta-orchestration — agent registry, routing, memory, SA scanner, inference',
    commands: [
      'agents.list', 'agents.health', 'agents.get',
      'route.task', 'do',
      'memory.store', 'memory.relate', 'memory.query', 'memory.list',
      'sa-scan.run', 'sa-scan.ticker',
      'inference.run', 'inference.history',
      'pipeline.health', 'pipeline.status',
      'config.list', 'config.check', 'config.get',
      'dispatch.telegram',
    ],
    status: 'active',
  },
];

export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  constructor() {
    for (const agent of BUILTIN_AGENTS) {
      this.agents.set(agent.id, agent);
    }
  }

  list(): Agent[] {
    return Array.from(this.agents.values());
  }

  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  register(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  health(): Record<string, { status: string; commands: number }> {
    const result: Record<string, { status: string; commands: number }> = {};
    for (const [id, agent] of this.agents) {
      result[id] = { status: agent.status, commands: agent.commands.length };
    }
    return result;
  }

  findByCommand(command: string): Agent | undefined {
    for (const agent of this.agents.values()) {
      if (agent.commands.includes(command)) return agent;
    }
    return undefined;
  }
}
