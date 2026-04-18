import type { RouteDecision } from '../types.js';
import { AgentRegistry } from './agent-registry.js';

interface TaskPattern {
  keywords: string[];
  target: string;
  command: string;
  argMapping?: (task: string) => Record<string, unknown>;
}

const PATTERNS: TaskPattern[] = [
  // BuilderBee patterns
  { keywords: ['list clients', 'show clients', 'client list'], target: 'builderbee', command: 'clients.list' },
  { keywords: ['client health', 'health score', 'health check'], target: 'builderbee', command: 'health.check' },
  { keywords: ['create client', 'new client', 'add client'], target: 'builderbee', command: 'clients.create' },
  { keywords: ['list workflows', 'show workflows'], target: 'builderbee', command: 'workflows.list' },
  { keywords: ['trigger workflow', 'run workflow', 'start workflow'], target: 'builderbee', command: 'workflows.trigger' },
  { keywords: ['deploy snapshot', 'apply snapshot'], target: 'builderbee', command: 'snapshots.deploy' },

  // AOB patterns
  { keywords: ['list students', 'show students', 'student list'], target: 'aob', command: 'students.list' },
  { keywords: ['get student', 'find student', 'student info'], target: 'aob', command: 'students.get' },
  { keywords: ['search student', 'look up student'], target: 'aob', command: 'students.search' },
  { keywords: ['payment status', 'check payment', 'billing'], target: 'aob', command: 'payments.status' },
  { keywords: ['list payments', 'payment history'], target: 'aob', command: 'payments.list' },
  { keywords: ['community member', 'mighty member', 'look up member'], target: 'aob', command: 'community.lookup' },
  { keywords: ['list programs', 'show programs'], target: 'aob', command: 'programs.list' },
  { keywords: ['list cohorts', 'show cohorts'], target: 'aob', command: 'cohorts.list' },
  { keywords: ['check certification', 'is certified', 'certification status'], target: 'aob', command: 'certifications.check' },
  { keywords: ['issue certification', 'certify student', 'grant certification'], target: 'aob', command: 'certifications.issue' },
  { keywords: ['enroll student', 'enrollment'], target: 'aob', command: 'students.get' },
  { keywords: ['retreat', 'booking', 'book retreat'], target: 'aob', command: 'retreats.list' },

  // Centaurion patterns
  { keywords: ['sa scan', 'situational awareness', 'scan tickers', 'market scan'], target: 'centaurion', command: 'sa-scan.run' },
  { keywords: ['pipeline health', 'system health', 'check pipeline'], target: 'centaurion', command: 'pipeline.health' },
  { keywords: ['agent list', 'list agents', 'show agents'], target: 'centaurion', command: 'agents.list' },
  { keywords: ['config check', 'check config', 'configuration'], target: 'centaurion', command: 'config.check' },
];

export class TaskRouter {
  constructor(private registry: AgentRegistry) {}

  route(task: string): RouteDecision {
    const normalized = task.toLowerCase().trim();

    // Pattern matching
    for (const pattern of PATTERNS) {
      for (const keyword of pattern.keywords) {
        if (normalized.includes(keyword)) {
          const agent = this.registry.get(pattern.target);
          if (agent && agent.status === 'active') {
            return {
              target: pattern.target,
              command: pattern.command,
              args: pattern.argMapping ? pattern.argMapping(task) : {},
              confidence: 0.85,
              reasoning: `Matched keyword "${keyword}" → ${pattern.target}/${pattern.command}`,
            };
          }
        }
      }
    }

    // Fuzzy: check if any agent has a command that partially matches
    const words = normalized.split(/\s+/);
    for (const agent of this.registry.list()) {
      for (const cmd of agent.commands) {
        const cmdParts = cmd.split('.');
        if (words.some((w) => cmdParts.some((p) => p.includes(w) || w.includes(p)))) {
          return {
            target: agent.target,
            command: cmd,
            args: {},
            confidence: 0.5,
            reasoning: `Fuzzy match: word overlap with ${agent.target}/${cmd}`,
          };
        }
      }
    }

    return {
      target: '',
      command: '',
      args: {},
      confidence: 0,
      reasoning: `No matching agent found for task: "${task}"`,
    };
  }
}
