#!/usr/bin/env node
import { Command } from 'commander';
import { createStudentsCommand } from './commands/students.js';
import { createContactsCommand } from './commands/contacts.js';
import { createPaymentsCommand } from './commands/payments.js';
import { createCommunityCommand } from './commands/community.js';
import { createProgramsCommand, createCohortsCommand, createCertificationsCommand } from './commands/programs.js';
import { createRetreatsCommand } from './commands/retreats.js';

const program = new Command();

program
  .name('aob')
  .description('AOB CLI — Unified CLI across Ontraport, Stripe, Mighty Networks, RetreatGuru')
  .version('0.1.0');

program.addCommand(createStudentsCommand());
program.addCommand(createContactsCommand());
program.addCommand(createPaymentsCommand());
program.addCommand(createCommunityCommand());
program.addCommand(createProgramsCommand());
program.addCommand(createCohortsCommand());
program.addCommand(createCertificationsCommand());
program.addCommand(createRetreatsCommand());

program.parse();
