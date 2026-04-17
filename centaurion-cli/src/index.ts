#!/usr/bin/env node
import { Command } from 'commander';
import { createAgentsCommand } from './commands/agents.js';
import { createRouteCommand } from './commands/route.js';
import { createMemoryCommand } from './commands/memory.js';
import { createSAScanCommand } from './commands/sa-scan.js';
import { createInferenceCommand } from './commands/inference.js';
import { createDoCommand } from './commands/do.js';

const program = new Command();

program
  .name('centaurion')
  .description('Centaurion CLI — Meta-orchestration layer enforcing the Three Laws')
  .version('0.1.0');

program.addCommand(createAgentsCommand());
program.addCommand(createRouteCommand());
program.addCommand(createMemoryCommand());
program.addCommand(createSAScanCommand());
program.addCommand(createInferenceCommand());
program.addCommand(createDoCommand());

program.parse();
