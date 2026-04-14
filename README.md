# UAPP — Universal Agent-to-Production Pipeline

A monorepo containing a Hono.js router and business-specific CLI harnesses that enable agents to operate three businesses programmatically.

## Architecture

```
GitHub (Universal Agent Interface)
  → UAPP Router (Hono.js on VPS behind Traefik)
    → BuilderBee CLI (GHL API wrapper)
    → AOB CLI (Ontraport/Stripe/Mighty unified)
    → Centaurion CLI (Meta-orchestration)
```

## Quick Start

```bash
npm install
npm test
npm run dev:router
```

## Workspaces

| Package | Description |
|---------|-------------|
| `router/` | Hono.js server that routes agent requests to business CLIs |
| `builderbee-cli/` | GHL API wrapper for web agency operations |
| `aob-cli/` | Unified CLI across AOB systems (planned) |
| `centaurion-cli/` | Meta-orchestration layer (planned) |

## API

### Router Endpoints

- `GET /` — API info
- `GET /health` — Health check (public)
- `GET /targets` — List registered targets (auth required)
- `POST /route` — Route command to target CLI (auth required)

### Route Request Format

```json
{
  "target": "builderbee",
  "command": "clients.list",
  "args": { "limit": 10 }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `UAPP_API_KEY` | Yes | Router authentication key |
| `GHL_API_KEY` | Yes | GoHighLevel API key |
| `GHL_LOCATION_ID` | No | Default GHL location |
| `PORT` | No | Router port (default: 3100) |
