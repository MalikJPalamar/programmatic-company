#!/usr/bin/env node
import { Command } from 'commander';
import { createStudentsCommand } from './commands/students.js';
import { createContactsCommand } from './commands/contacts.js';
import { createPaymentsCommand } from './commands/payments.js';
import { createCommunityCommand } from './commands/community.js';

const program = new Command();

program
  .name('aob')
  .description('AOB CLI — Unified CLI across Ontraport, Stripe, Mighty Networks')
  .version('0.1.0');

program.addCommand(createStudentsCommand());
program.addCommand(createContactsCommand());
program.addCommand(createPaymentsCommand());
program.addCommand(createCommunityCommand());

program.parse();
