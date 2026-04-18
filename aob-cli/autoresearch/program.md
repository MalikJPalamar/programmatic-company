# AOB CLI Autoresearch Program

## Scope
AOB unifies Ontraport (CRM), Stripe (payments), Mighty Networks (community),
and RetreatGuru (retreats) into a single agent-operable CLI with the adapter
pattern enabling CRM migration (Ontraport → GHL) as a one-line swap.

## Non-Negotiable Constraints
- All commands support --json output
- CRM accessed exclusively through CRMAdapter interface (swap without consumer changes)
- StudentFusionService degrades gracefully when subsystems are unavailable
- Credentials via environment variables
- Unit tests with mocked API responses for every adapter

## Target Coverage (100% = all business operations agent-accessible)
- CRM (Ontraport): contacts CRUD, search
- Payments (Stripe): payment history, subscription status
- Community (Mighty Networks): member lookup, activity status
- Programs: list, get, cohorts, certifications
- Retreats (RetreatGuru): list, book, availability

## Composite Score Weights
- Accuracy: 40% (commands produce correct output against mocked data)
- Actionability: 30% (--json parseable, CLI installable, graceful degradation)
- Coverage: 30% (% of target business operations wrapped)
