import { Command } from 'commander';
import { formatOutput, formatError } from '../utils/output.js';

interface ConfigEntry {
  key: string;
  value: string;
  source: 'env' | 'default';
}

const CONFIG_KEYS: Record<string, { envVar: string; defaultValue: string; description: string }> = {
  'router.port': { envVar: 'PORT', defaultValue: '3100', description: 'UAPP Router port' },
  'router.api_key': { envVar: 'UAPP_API_KEY', defaultValue: '', description: 'Router API key (required)' },
  'builderbee.ghl_key': { envVar: 'GHL_API_KEY', defaultValue: '', description: 'GoHighLevel API key' },
  'builderbee.location': { envVar: 'GHL_LOCATION_ID', defaultValue: '', description: 'Default GHL location' },
  'aob.ontraport_key': { envVar: 'ONTRAPORT_API_KEY', defaultValue: '', description: 'Ontraport API key' },
  'aob.ontraport_app': { envVar: 'ONTRAPORT_APP_ID', defaultValue: '', description: 'Ontraport app ID' },
  'aob.stripe_key': { envVar: 'STRIPE_SECRET_KEY', defaultValue: '', description: 'Stripe secret key' },
  'aob.mighty_key': { envVar: 'MIGHTY_API_KEY', defaultValue: '', description: 'Mighty Networks API key' },
  'aob.mighty_community': { envVar: 'MIGHTY_COMMUNITY_ID', defaultValue: '', description: 'Mighty community ID' },
  'aob.retreatguru_key': { envVar: 'RETREATGURU_API_KEY', defaultValue: '', description: 'RetreatGuru API key' },
};

export function createConfigCommand(): Command {
  const config = new Command('config').description('Configuration management');

  config
    .command('list')
    .description('List all configuration keys and their status')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      const entries: ConfigEntry[] = Object.entries(CONFIG_KEYS).map(([key, def]) => {
        const envValue = process.env[def.envVar];
        return {
          key,
          value: envValue ? '***' + envValue.slice(-4) : def.defaultValue || '(not set)',
          source: envValue ? 'env' as const : 'default' as const,
        };
      });
      console.log(formatOutput(entries, { json: opts.json }));
    });

  config
    .command('check')
    .description('Validate that required configuration is present')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      const missing: string[] = [];
      const present: string[] = [];

      for (const [key, def] of Object.entries(CONFIG_KEYS)) {
        if (process.env[def.envVar]) {
          present.push(key);
        } else if (!def.defaultValue) {
          missing.push(`${key} (${def.envVar}): ${def.description}`);
        }
      }

      const result = {
        valid: missing.length === 0,
        configured: present.length,
        missing: missing.length,
        details: missing.length > 0 ? missing : undefined,
      };

      console.log(formatOutput(result, { json: opts.json }));
      if (missing.length > 0) process.exitCode = 1;
    });

  config
    .command('get')
    .description('Get a specific config value')
    .argument('<key>', 'Config key (e.g. router.port)')
    .option('--json', 'Output as JSON')
    .action((key: string, opts) => {
      const def = CONFIG_KEYS[key];
      if (!def) {
        console.error(formatError('CONFIG_NOT_FOUND', `Unknown config key: ${key}. Run "config list" to see available keys.`, { json: opts.json }));
        process.exitCode = 1;
        return;
      }
      const value = process.env[def.envVar] ?? def.defaultValue;
      console.log(formatOutput({ key, value: value || '(not set)', envVar: def.envVar, description: def.description }, { json: opts.json }));
    });

  return config;
}
