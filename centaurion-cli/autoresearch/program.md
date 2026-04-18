# Centaurion CLI Autoresearch Program

## Scope
Meta-orchestration layer enforcing the Three Laws as code.
Provides agent registry, natural language task routing, knowledge graph memory,
situational awareness scanning, FEP-based inference, and cross-business orchestration.

## Non-Negotiable Constraints
- Three Laws enforced: Hierarchy > Routing > Coupling
- All commands support --json output
- TaskRouter must explain its routing decisions (confidence + reasoning)
- InferenceEngine must track surprise over time (FEP compliance)
- Memory store interface must be swappable (in-memory → Neo4j/Graphiti)

## Composite Score Weights
- Accuracy: 40% (routing correctness, inference quality)
- Actionability: 30% (agent-parseable output, dispatch works end-to-end)
- Coverage: 30% (% of orchestration capabilities implemented)
