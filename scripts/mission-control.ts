#!/usr/bin/env tsx
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

async function readResultsTsv() {
  const path = resolve(ROOT, 'autoresearch/results.tsv');
  try {
    const content = await readFile(path, 'utf-8');
    return content.trim().split('\n').slice(1).filter(Boolean).map((line) => {
      const cols = line.split('\t');
      return { date: cols[0], cycle: cols[1], cs: parseFloat(cols[2] ?? '0'),
        acc: parseFloat(cols[3] ?? '0'), act: parseFloat(cols[4] ?? '0'), cov: parseFloat(cols[5] ?? '0') };
    });
  } catch { return []; }
}

function getGitStatus() {
  try {
    const branch = execSync('git branch --show-current', { cwd: ROOT, encoding: 'utf-8' }).trim();
    const log = execSync('git log --oneline origin/main..HEAD 2>/dev/null', { cwd: ROOT, encoding: 'utf-8' });
    const ahead = log.trim().split('\n').filter(Boolean).length;
    const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf-8' });
    const uncommitted = status.trim().split('\n').filter(Boolean).length;
    return { branch, ahead, uncommitted };
  } catch { return { branch: 'unknown', ahead: 0, uncommitted: 0 }; }
}

async function status() {
  const cycles = await readResultsTsv();
  const git = getGitStatus();
  const latest = cycles[cycles.length - 1];

  console.log('');
  console.log('='.repeat(58));
  console.log('           UAPP MISSION CONTROL - STATUS');
  console.log('='.repeat(58));
  console.log(`  Branch:        ${git.branch}`);
  console.log(`  Commits ahead: ${git.ahead}`);
  console.log(`  Uncommitted:   ${git.uncommitted}`);
  console.log('');
  if (latest) {
    console.log(`  Last Cycle:    ${latest.cycle} (${latest.date})`);
    console.log(`  Composite:     ${latest.cs.toFixed(1)}/100`);
    console.log(`  Accuracy: ${latest.acc.toFixed(1)} | Actionability: ${latest.act.toFixed(1)} | Coverage: ${latest.cov.toFixed(1)}`);
  } else {
    console.log('  No cycles scored yet.');
  }
  console.log('');
  console.log('  TARGET          COMMANDS    STATUS');
  console.log('  --------------- ----------  -------');
  console.log('  BuilderBee      15 / 15     LIVE');
  console.log('  AOB              0 / 25     PLANNED');
  console.log('  Centaurion       0 / 20     PLANNED');
  console.log('');
}

async function next() {
  console.log('');
  console.log('='.repeat(58));
  console.log("           WHAT'S NEXT");
  console.log('='.repeat(58));
  console.log('');
  console.log('  Milestone 1 - BuilderBee CLI: COMPLETE (15/15 commands)');
  console.log('  [x] Phase 1: UAPP Router Core');
  console.log('  [x] Phase 2: BuilderBee CLI (7 base commands)');
  console.log('  [x] Phase 3: Pipeline Integration + Mission Control');
  console.log('  [x] Phase 4: Remaining BB commands (8 more = 15 total)');
  console.log('');
  console.log('  Milestone 2 - AOB CLI (next)');
  console.log('  [ ] Phase 1: CRM Adapter Layer (Ontraport)');
  console.log('  [ ] Phase 2: Multi-System Fusion Endpoints');
  console.log('  [ ] Phase 3: Program & Certification Engine');
  console.log('  [ ] Phase 4: Retreat & Booking Integration');
  console.log('  [ ] Phase 5: Router Integration + Deployment');
  console.log('');
}

async function main() {
  const command = process.argv[2] ?? 'status';
  switch (command) {
    case 'status': await status(); break;
    case 'next': await next(); break;
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Usage: npm run mc -- [status|next]');
  }
}

main().catch(console.error);
