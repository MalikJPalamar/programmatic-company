# UAPP — Universal Agent-to-Production Pipeline

## Project Overview
UAPP is a monorepo containing a Hono.js router and business-specific CLI harnesses
that enable agents to operate three businesses programmatically. GitHub is the universal
interface, GitHub Actions is the quality gate, and Dokploy/Traefik on Hostinger VPS
is the deployment surface.

## Architecture
- **Router** (`router/`): Hono.js server that routes agent requests to business CLIs
- **BuilderBee CLI** (`builderbee-cli/`): GHL API wrapper for web agency operations
- **AOB CLI** (`aob-cli/`): Unified CLI across Ontraport, Stripe, Mighty Networks, WordPress
- **Centaurion CLI** (`centaurion-cli/`): Meta-orchestration layer with Neo4j/Graphiti

## Non-Negotiable Constraints
- All CLIs must support `--json` output on every command
- Adapter pattern required for any external API (swap without consumer changes)
- Every command must have unit tests with mocked API responses
- No hardcoded credentials — all secrets via environment variables
- Deploy via Dokploy on Hostinger VPS behind Traefik
- GitHub is the universal interface — all triggers via Actions/dispatch
- Centaurion Three Laws enforced: Hierarchy, Routing, Coupling

## Tech Stack
- Runtime: Node.js 20+
- Language: TypeScript (strict mode)
- Router: Hono.js with @hono/node-server
- CLIs: Commander.js
- Tests: Vitest
- Package manager: npm workspaces

## Commands
- `npm test` — run all workspace tests
- `npm run build` — build all workspaces
- `npm run dev:router` — start router in dev mode
- `npm run test -w router` — test router only
- `npm run test -w builderbee-cli` — test CLI only

## Conventions
- Structured JSON responses: `{ success: boolean, data?: T, error?: { code: string, message: string } }`
- Environment variables for all secrets (GHL_API_KEY, UAPP_API_KEY, etc.)
- Adapter pattern for external APIs
- Every CLI command supports `--json` flag for machine-readable output
