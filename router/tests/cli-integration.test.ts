import { describe, it, expect } from 'vitest';
import { execCLI, parseCLIOutput } from '../src/cli-executor.js';

describe('CLI executor integration', () => {
  it('executes bb --help and gets output', async () => {
    const result = await execCLI('builderbee', '--help', {}, { timeout: 10000 });
    // --help exits with 0 and prints usage
    expect(result.stdout).toContain('BuilderBee');
  }, 15000);

  it('executes centaurion agents list --json', async () => {
    const result = await execCLI('centaurion', 'agents.list', {}, { timeout: 10000 });
    expect(result.exitCode).toBe(0);
    const parsed = parseCLIOutput(result);
    expect(Array.isArray(parsed)).toBe(true);
    const agents = parsed as Array<{ id: string }>;
    expect(agents.some((a) => a.id === 'builderbee')).toBe(true);
  }, 15000);

  it('executes centaurion pipeline health --json', async () => {
    const result = await execCLI('centaurion', 'pipeline.health', {}, { timeout: 10000 });
    expect(result.exitCode).toBe(0);
    const parsed = parseCLIOutput(result) as { status?: string; totalCommands?: number };
    expect(parsed.status).toBeDefined();
    expect(parsed.totalCommands).toBeGreaterThan(0);
  }, 15000);

  it('passes positional args correctly', async () => {
    const result = await execCLI('centaurion', 'agents.get', { _positional: ['builderbee'] }, { timeout: 10000 });
    expect(result.exitCode).toBe(0);
    const parsed = parseCLIOutput(result) as { id?: string; name?: string };
    expect(parsed.id).toBe('builderbee');
    expect(parsed.name).toBe('BuilderBee');
  }, 15000);

  it('passes flag args correctly', async () => {
    const result = await execCLI('centaurion', 'config.get', { _positional: ['router.port'] }, { timeout: 10000 });
    expect(result.exitCode).toBe(0);
    const parsed = parseCLIOutput(result) as { key?: string };
    expect(parsed.key).toBe('router.port');
  }, 15000);

  it('handles unknown CLI gracefully', async () => {
    await expect(execCLI('nonexistent', 'test')).rejects.toThrow('Unknown CLI');
  });
});
