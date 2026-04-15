import { describe, it, expect } from 'vitest';
import { MemoryStore } from '../../src/services/memory-store.js';

describe('MemoryStore', () => {
  it('stores and retrieves an entity', () => {
    const store = new MemoryStore();
    const entity = store.storeEntity('Acme Corp', 'client', { industry: 'tech' });
    expect(entity.name).toBe('Acme Corp');
    expect(entity.type).toBe('client');

    const retrieved = store.getEntity(entity.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.name).toBe('Acme Corp');
  });

  it('finds entity by name', () => {
    const store = new MemoryStore();
    store.storeEntity('Acme Corp', 'client');
    const found = store.findEntityByName('acme corp');
    expect(found).toBeDefined();
    expect(found!.name).toBe('Acme Corp');
  });

  it('updates existing entity on re-store', () => {
    const store = new MemoryStore();
    const e1 = store.storeEntity('Acme Corp', 'client', { score: 80 });
    const e2 = store.storeEntity('Acme Corp', 'client', { score: 90, tier: 'gold' });
    expect(e1.id).toBe(e2.id);
    expect(e2.properties.score).toBe(90);
    expect(e2.properties.tier).toBe('gold');
  });

  it('creates relations between entities', () => {
    const store = new MemoryStore();
    const acme = store.storeEntity('Acme Corp', 'client');
    const bb = store.storeEntity('BuilderBee', 'agent');
    const rel = store.storeRelation(acme.id, bb.id, 'managed_by');
    expect(rel.sourceId).toBe(acme.id);
    expect(rel.targetId).toBe(bb.id);
    expect(rel.relation).toBe('managed_by');
  });

  it('throws when relating nonexistent entities', () => {
    const store = new MemoryStore();
    const acme = store.storeEntity('Acme Corp', 'client');
    expect(() => store.storeRelation(acme.id, 'fake_id', 'client_of')).toThrow('not found');
  });

  it('queries entities by type', () => {
    const store = new MemoryStore();
    store.storeEntity('Acme Corp', 'client');
    store.storeEntity('Beta Inc', 'client');
    store.storeEntity('Sarah', 'student');

    const graph = store.query({ type: 'client' });
    expect(graph.entities).toHaveLength(2);
  });

  it('queries entities by name', () => {
    const store = new MemoryStore();
    store.storeEntity('Acme Corp', 'client');
    store.storeEntity('Beta Inc', 'client');

    const graph = store.query({ entity: 'Acme' });
    expect(graph.entities).toHaveLength(1);
  });

  it('queries with relation filter', () => {
    const store = new MemoryStore();
    const acme = store.storeEntity('Acme Corp', 'client');
    const bb = store.storeEntity('BuilderBee', 'agent');
    const sarah = store.storeEntity('Sarah', 'student');
    store.storeRelation(acme.id, bb.id, 'managed_by');
    store.storeRelation(sarah.id, acme.id, 'enrolled_in');

    const graph = store.query({ entity: 'Acme', relation: 'managed_by' });
    expect(graph.relations).toHaveLength(1);
    expect(graph.relations[0].relation).toBe('managed_by');
  });

  it('expands graph with depth', () => {
    const store = new MemoryStore();
    const acme = store.storeEntity('Acme Corp', 'client');
    const bb = store.storeEntity('BuilderBee', 'agent');
    const sarah = store.storeEntity('Sarah', 'student');
    store.storeRelation(acme.id, bb.id, 'managed_by');
    store.storeRelation(sarah.id, acme.id, 'client_of');

    const graph = store.query({ entity: 'Acme', depth: 2 });
    expect(graph.entities.length).toBeGreaterThanOrEqual(2);
  });

  it('lists all entities and relations', () => {
    const store = new MemoryStore();
    store.storeEntity('A', 'client');
    store.storeEntity('B', 'student');
    expect(store.listEntities()).toHaveLength(2);
    expect(store.listRelations()).toHaveLength(0);
  });
});
