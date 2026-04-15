import type { MemoryEntity, MemoryRelation, MemoryQuery, MemoryGraph } from '../types.js';

/**
 * In-memory graph store. In production, this would be backed by Neo4j/Graphiti.
 * The interface stays the same — swap the backing store without changing consumers.
 */
export class MemoryStore {
  private entities: Map<string, MemoryEntity> = new Map();
  private relations: MemoryRelation[] = [];
  private nextRelId = 1;

  storeEntity(name: string, type: string, properties: Record<string, unknown> = {}): MemoryEntity {
    const existing = this.findEntityByName(name);
    if (existing) {
      existing.properties = { ...existing.properties, ...properties };
      existing.updatedAt = new Date().toISOString();
      return existing;
    }

    const entity: MemoryEntity = {
      id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      type,
      properties,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.entities.set(entity.id, entity);
    return entity;
  }

  getEntity(id: string): MemoryEntity | undefined {
    return this.entities.get(id);
  }

  findEntityByName(name: string): MemoryEntity | undefined {
    for (const entity of this.entities.values()) {
      if (entity.name.toLowerCase() === name.toLowerCase()) return entity;
    }
    return undefined;
  }

  storeRelation(sourceId: string, targetId: string, relation: string, properties?: Record<string, unknown>): MemoryRelation {
    const source = this.entities.get(sourceId);
    const target = this.entities.get(targetId);
    if (!source) throw new Error(`Source entity ${sourceId} not found`);
    if (!target) throw new Error(`Target entity ${targetId} not found`);

    const rel: MemoryRelation = {
      id: `r_${this.nextRelId++}`,
      sourceId,
      targetId,
      relation,
      properties,
      createdAt: new Date().toISOString(),
    };

    this.relations.push(rel);
    return rel;
  }

  query(q: MemoryQuery): MemoryGraph {
    let entities = Array.from(this.entities.values());

    if (q.entity) {
      entities = entities.filter((e) =>
        e.name.toLowerCase().includes(q.entity!.toLowerCase())
      );
    }
    if (q.type) {
      entities = entities.filter((e) => e.type === q.type);
    }

    const entityIds = new Set(entities.map((e) => e.id));
    let relations = this.relations.filter(
      (r) => entityIds.has(r.sourceId) || entityIds.has(r.targetId)
    );

    if (q.relation) {
      relations = relations.filter((r) => r.relation === q.relation);
    }

    // Expand graph to requested depth
    if (q.depth && q.depth > 1) {
      for (let d = 1; d < q.depth; d++) {
        const newIds = new Set<string>();
        for (const rel of relations) {
          if (!entityIds.has(rel.sourceId)) newIds.add(rel.sourceId);
          if (!entityIds.has(rel.targetId)) newIds.add(rel.targetId);
        }
        for (const id of newIds) {
          const e = this.entities.get(id);
          if (e) {
            entities.push(e);
            entityIds.add(id);
          }
        }
        relations = this.relations.filter(
          (r) => entityIds.has(r.sourceId) || entityIds.has(r.targetId)
        );
      }
    }

    return { entities, relations };
  }

  listEntities(): MemoryEntity[] {
    return Array.from(this.entities.values());
  }

  listRelations(): MemoryRelation[] {
    return [...this.relations];
  }
}
