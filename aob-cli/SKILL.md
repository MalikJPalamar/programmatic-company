# AOB CLI — Agent Capability Manifest

## Overview
Unified CLI across Ontraport (CRM), Stripe (payments), Mighty Networks (community),
and RetreatGuru (retreats/bookings). Designed with adapter pattern for CRM migration.

## Commands (25 total)

### students (3) — Multi-system fusion
- `aob students list [--program <slug>] [--limit <n>] [--json]`
- `aob students get <id> [--json]`
- `aob students search <query> [--json]`

### contacts (5) — CRM (Ontraport)
- `aob contacts list [--tag <tag>] [--limit <n>] [--json]`
- `aob contacts get <id> [--json]`
- `aob contacts search <query> [--json]`
- `aob contacts create --first-name <n> --last-name <n> [--json]`
- `aob contacts update <id> [--first-name <n>] [--json]`

### payments (2) — Stripe
- `aob payments list --customer <id> [--limit <n>] [--json]`
- `aob payments status --customer <id> [--json]`

### community (2) — Mighty Networks
- `aob community members [--group <name>] [--limit <n>] [--json]`
- `aob community lookup <email> [--json]`

### programs (2) — Program management
- `aob programs list [--status <status>] [--json]`
- `aob programs get <id> [--json]`

### cohorts (2) — Cohort management
- `aob cohorts list --program <id> [--status <status>] [--json]`
- `aob cohorts get <cohortId> --program <id> [--json]`

### certifications (3)
- `aob certifications check --student <id> --program <id> [--json]`
- `aob certifications issue --student <id> --program <id> [--json]`
- `aob certifications list --student <id> [--json]`

### retreats (6) — RetreatGuru
- `aob retreats list [--location <loc>] [--upcoming] [--json]`
- `aob retreats get <id> [--json]`
- `aob retreats availability <id> [--json]`
- `aob retreats bookings <retreatId> [--json]`
- `aob retreats book --retreat <id> --name <n> --email <e> [--json]`
- `aob retreats booking <id> [--json]`

## Required Environment Variables
- `ONTRAPORT_API_KEY`, `ONTRAPORT_APP_ID` — CRM (required)
- `STRIPE_SECRET_KEY` — Payments (optional, degrades gracefully)
- `MIGHTY_API_KEY`, `MIGHTY_COMMUNITY_ID` — Community (optional)
- `RETREATGURU_API_KEY` — Retreats (required for retreat commands)
