# Centaurion CLI Development Methodology v1.0

## Task Routing Pattern
1. Register keyword patterns for known tasks
2. Fuzzy match as fallback (word overlap with command names)
3. Return confidence score so caller can decide whether to execute or ask
4. Cross-business patterns detected separately from single-target routing

## Inference Engine Pattern
1. Match signal against known patterns (regex)
2. Calculate surprise (base - adjustments for repeated signals)
3. Return prediction + action + confidence
4. Track history for surprise adaptation over time

## Memory Store Pattern
- Entity-relation graph (nodes + edges)
- In-memory implementation today, Neo4j/Graphiti interface for production
- Query supports: entity name filter, type filter, relation filter, depth traversal
