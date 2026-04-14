# BuilderBee CLI — Agent Capability Manifest

## Overview
BuilderBee wraps the GoHighLevel (GHL) API for programmatic web agency management.
It provides structured CLI access to sub-accounts, contacts, workflows, snapshots,
and client health scoring.

## Commands

### clients
- `bb clients list [--status <status>] [--limit <n>] [--json]` — List sub-accounts
- `bb clients get <id> [--json]` — Get a specific client

### contacts
- `bb contacts list [--location <id>] [--limit <n>] [--json]` — List contacts
- `bb contacts search <query> [--location <id>] [--json]` — Search contacts

### workflows
- `bb workflows list [--location <id>] [--status <status>] [--json]` — List workflows
- `bb workflows trigger --workflow <id> --contact <id> [--json]` — Trigger a workflow

### snapshots
- `bb snapshots list [--json]` — List available snapshots

### health
- `bb health check <clientId> [--json]` — Calculate client health score

## Output Modes
- **Human**: Formatted tables and key-value displays (default)
- **Machine**: Structured JSON with `--json` flag on any command

## Required Environment Variables
- `GHL_API_KEY` — GoHighLevel API key (required)
- `GHL_LOCATION_ID` — Default location ID (optional, overridden by --location)

## Error Format
All errors follow: `{ success: false, error: { code: string, message: string } }`
