# BuilderBee CLI Autoresearch Program

## Scope
BuilderBee wraps the GoHighLevel (GHL) API into an agent-operable CLI.
It is the first business CLI in the UAPP pipeline, serving the web agency vertical.

## Non-Negotiable Constraints
- All commands support --json output
- GHL API accessed exclusively through the GHLAdapter (adapter pattern)
- Sub-account isolation: commands operate within a single sub-account context
- Credentials via environment variables (GHL_API_KEY, GHL_LOCATION_ID)
- Unit tests with mocked GHL responses for every command

## Target Coverage (100% = all GHL endpoints needed for agency ops)
- Sub-accounts (clients): list, get, create
- Contacts: list, search, create, update
- Workflows: list, trigger, pause
- Snapshots: list, deploy
- Health: client health score calculation

## Composite Score Weights
- Accuracy: 40% (commands produce correct output against mocked GHL data)
- Actionability: 30% (--json output parseable, CLI installable via bin)
- Coverage: 30% (% of target GHL endpoints wrapped)
