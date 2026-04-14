# UAPP Autoresearch Program

## Non-Negotiable Constraints
- All CLIs must support --json output on every command
- Adapter pattern required for any external API (swap without consumer changes)
- Every command must have unit tests with mocked API responses
- No hardcoded credentials — all secrets via environment variables
- Deploy via Dokploy on Hostinger VPS behind Traefik
- GitHub is the universal interface — all triggers via Actions/dispatch
- Centaurion Three Laws enforced: Hierarchy, Routing, Coupling

## Composite Score Weights
- Accuracy: 40% (build success, test pass rate, API correctness)
- Actionability: 30% (agent-parseable output, deployment serves traffic)
- Coverage: 30% (% of business surface wrapped by CLI)

## Evolution Permissions
- Auto-evolve: test patterns, error handling, code organization, docs
- Require approval: new command groups, API integrations, auth changes, routing logic

## Simplicity Criterion
All else being equal, simpler is better. A marginal CS improvement
that adds ugly complexity — discard. A simplification that maintains
the same CS — keep.

## Scoring Guidelines

### Accuracy (40%)
- Build compiles without errors: +10
- All tests pass: +15
- CLI commands produce correct output against real/mocked API: +10
- No runtime errors in happy path: +5

### Actionability (30%)
- --json output parses cleanly (valid JSON): +10
- Output schema is consistent across commands: +10
- Deployment serves traffic / CLI is installable: +10

### Coverage (30%)
- Percentage of target business surface wrapped by CLI commands
- BuilderBee: GHL endpoints (sub-accounts, contacts, workflows, snapshots, health)
- AOB: Systems unified (Ontraport, Stripe, Mighty, WordPress, RetreatGuru, GHL)
- Centaurion: Orchestration capabilities (routing, memory, inference, SA scan)
