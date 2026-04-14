#!/usr/bin/env node
import { Command } from 'commander';
import { createClientsCommand } from './commands/clients.js';
import { createContactsCommand } from './commands/contacts.js';
import { createWorkflowsCommand } from './commands/workflows.js';
import { createHealthCommand } from './commands/health.js';
import { createSnapshotsCommand } from './commands/snapshots.js';

const program = new Command();

program
  .name('bb')
  .description('BuilderBee CLI — GHL API wrapper for agent-driven web agency operations')
  .version('0.1.0');

program.addCommand(createClientsCommand());
program.addCommand(createContactsCommand());
program.addCommand(createWorkflowsCommand());
program.addCommand(createHealthCommand());
program.addCommand(createSnapshotsCommand());

program.parse();
