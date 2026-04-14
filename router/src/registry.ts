import type { TargetRegistry, TargetConfig } from './types.js';

const registry: TargetRegistry = {};

export function registerTarget(config: TargetConfig): void {
  registry[config.name] = config;
}

export function getTarget(name: string): TargetConfig | undefined {
  return registry[name];
}

export function listTargets(): Record<string, { description: string; commands: string[] }> {
  const result: Record<string, { description: string; commands: string[] }> = {};
  for (const [name, config] of Object.entries(registry)) {
    result[name] = {
      description: config.description,
      commands: config.commands,
    };
  }
  return result;
}

export function getRegistry(): TargetRegistry {
  return { ...registry };
}
