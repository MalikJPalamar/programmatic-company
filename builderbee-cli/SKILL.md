# BuilderBee CLI — Agent Capability Manifest

## Overview
BuilderBee wraps the GoHighLevel (GHL) API for programmatic web agency management.
It provides structured CLI access to sub-accounts, contacts, workflows, snapshots,
and client health scoring.

## Commands (15 total)

### clients (5 commands)
- `bb clients list [--status <status>] [--limit <n>] [--json]` — List sub-accounts
- `bb clients get <id> [--json]` — Get a specific client
- `bb clients create --name <name> --email <email> [--phone <phone>] [--json]` — Create client
- `bb clients update <id> [--name <n>] [--email <e>] [--status <s>] [--json]` — Update client
- `bb clients delete <id> [--json]` — Delete client

### contacts (4 commands)
- `bb contacts list [--location <id>] [--limit <n>] [--json]` — List contacts
- `bb contacts search <query> [--location <id>] [--json]` — Search contacts
- `bb contacts create --first-name <n> --last-name <n> [--email <e>] [--location <id>] [--json]` — Create contact
- `bb contacts update <id> [--first-name <n>] [--last-name <n>] [--email <e>] [--json]` — Update contact

### workflows (4 commands)
- `bb workflows list [--location <id>] [--status <status>] [--json]` — List workflows
- `bb workflows trigger --workflow <id> --contact <id> [--json]` — Trigger workflow
- `bb workflows pause --workflow <id> [--location <id>] [--json]` — Pause workflow
- `bb workflows status --workflow <id> [--location <id>] [--json]` — Get workflow status

### snapshots (2 commands)
- `bb snapshots list [--json]` — List available snapshots
- `bb snapshots deploy --snapshot <id> --location <id> [--json]` — Deploy snapshot

### health (1 command)
- `bb health check <clientId> [--json]` — Calculate client health score

## Output Modes
- **Human**: Formatted tables and key-value displays (default)
- **Machine**: Structured JSON with `--json` flag on any command

## Required Environment Variables
- `GHL_API_KEY` — GoHighLevel API key (required)
- `GHL_LOCATION_ID` — Default location ID (optional, overridden by --location)

## Error Format
All errors follow: `{ success: false, error: { code: string, message: string } }`
