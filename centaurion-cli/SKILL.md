# Centaurion CLI — Agent Capability Manifest

## Overview
Meta-orchestration layer enforcing the Three Laws:
1. **Hierarchy**: Human > Centaurion > Business CLIs
2. **Routing**: Natural language → correct CLI with correct parameters
3. **Coupling**: CLIs communicate through Centaurion, never directly

## Commands (20 total)

### agents (3) — Agent registry
- `centaurion agents list [--json]`
- `centaurion agents health [--json]`
- `centaurion agents get <id> [--json]`

### route (1) — Task routing
- `centaurion route task <task> [--json]`

### do (1) — Cross-business orchestration
- `centaurion do <task> [--execute] [--json]`

### memory (4) — Knowledge graph
- `centaurion memory store --entity <name> --type <type> [--properties <json>] [--json]`
- `centaurion memory relate --source <id> --target <id> --relation <type> [--json]`
- `centaurion memory query [--entity <name>] [--type <type>] [--depth <n>] [--json]`
- `centaurion memory list [--json]`

### sa-scan (2) — Situational Awareness
- `centaurion sa-scan run [--tickers <list>] [--json]`
- `centaurion sa-scan ticker <symbol> [--json]`

### inference (2) — FEP-based prediction
- `centaurion inference run <signal> [--json]`
- `centaurion inference history [--json]`

### pipeline (2) — Pipeline operations
- `centaurion pipeline health [--json]`
- `centaurion pipeline status [--json]`

### config (3) — Configuration
- `centaurion config list [--json]`
- `centaurion config check [--json]`
- `centaurion config get <key> [--json]`

### dispatch (1) — Message routing
- `centaurion dispatch telegram <message> [--user <id>] [--execute] [--json]`

## Required Environment Variables
- `UAPP_API_KEY` — For --execute mode (routes through UAPP router)
- `UAPP_ROUTER_URL` — Router URL (defaults to http://localhost:3100)
