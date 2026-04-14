import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { registerTarget } from './registry.js';

const app = createApp();

// Register BuilderBee target (stub — will be replaced with real CLI integration)
registerTarget({
  name: 'builderbee',
  description: 'GHL API wrapper for web agency operations',
  commands: [
    'clients.list',
    'clients.get',
    'contacts.list',
    'contacts.search',
    'workflows.list',
    'workflows.trigger',
    'health.check',
  ],
  handler: async (command, args) => {
    // Stub handler — will delegate to BuilderBee CLI
    return {
      stub: true,
      message: `BuilderBee command "${command}" received`,
      args,
    };
  },
});

const port = parseInt(process.env.PORT ?? '3100', 10);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`UAPP Router running on http://localhost:${info.port}`);
});
