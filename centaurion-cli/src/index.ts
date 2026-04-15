#!/usr/bin/env node
import { Command } from 'commander';
import { createAgentsCommand } from './commands/agents.js';
import { createRouteCommand } from './commands/route.js';
import { createMemoryCommand } from './commands/memory.js';

const program = new Command();

program
  .name('centaurion')
  .description('Centaurion CLI — Meta-orchestration layer enforcing the Three Laws')
  .version('0.1.0');

program.addCommand(createAgentsCommand());
program.addCommand(createRouteCommand());
program.addCommand(createMemoryCommand());

program.parse();
