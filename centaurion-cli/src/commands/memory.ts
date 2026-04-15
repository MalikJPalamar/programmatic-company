import { Command } from 'commander';
import { MemoryStore } from '../services/memory-store.js';
import { formatOutput, formatError } from '../utils/output.js';

const store = new MemoryStore();

export function createMemoryCommand(): Command {
  const memory = new Command('memory').description('Knowledge graph memory (entity-relation store)');

  memory
    .command('store')
    .description('Store an entity in the knowledge graph')
    .requiredOption('--entity <name>', 'Entity name')
    .requiredOption('--type <type>', 'Entity type (client, student, program, business, agent)')
    .option('--properties <json>', 'JSON properties', '{}')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      try {
        const props = JSON.parse(opts.properties);
        const entity = store.storeEntity(opts.entity, opts.type, props);
        console.log(formatOutput(entity, { json: opts.json }));
      } catch (err) {
        console.error(formatError('MEMORY_STORE_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  memory
    .command('relate')
    .description('Create a relation between two entities')
    .requiredOption('--source <id>', 'Source entity ID')
    .requiredOption('--target <id>', 'Target entity ID')
    .requiredOption('--relation <type>', 'Relation type (client_of, enrolled_in, certified_by, managed_by)')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      try {
        const rel = store.storeRelation(opts.source, opts.target, opts.relation);
        console.log(formatOutput(rel, { json: opts.json }));
      } catch (err) {
        console.error(formatError('MEMORY_RELATE_FAILED', err instanceof Error ? err.message : 'Unknown error', { json: opts.json }));
        process.exitCode = 1;
      }
    });

  memory
    .command('query')
    .description('Query the knowledge graph')
    .option('--entity <name>', 'Filter by entity name')
    .option('--type <type>', 'Filter by entity type')
    .option('--relation <type>', 'Filter by relation type')
    .option('--depth <n>', 'Graph traversal depth', '1')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      const graph = store.query({
        entity: opts.entity,
        type: opts.type,
        relation: opts.relation,
        depth: parseInt(opts.depth, 10),
      });
      console.log(formatOutput(opts.json ? graph : { entities: graph.entities.length, relations: graph.relations.length, data: graph }, { json: opts.json }));
    });

  memory
    .command('list')
    .description('List all entities in memory')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      console.log(formatOutput(store.listEntities(), { json: opts.json }));
    });

  return memory;
}

export { store };
