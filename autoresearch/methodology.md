# UAPP Development Methodology v1.0

## Build Process
1. Discuss phase requirements and gray areas
2. Plan tasks with verify blocks
3. Execute implementation with TDD (test first, then implement)
4. Verify: run tests, check CLI output, validate JSON schemas
5. Ship: commit atomically, deploy if ready

## Testing Strategy
- Unit tests: mock all external APIs, test command logic in isolation
- Integration tests: real API sandbox calls (when available)
- CLI subprocess tests: invoke installed CLI, parse stdout
- E2E pipeline tests: full trigger-to-response flow

## Code Organization
- One file per command group (e.g., clients.ts, contacts.ts)
- Adapters in dedicated directory, one per external API
- Shared types in types.ts at package root
- Utils for cross-cutting concerns (output formatting, auth)

## Error Handling
- Structured error responses: { success: false, error: { code, message } }
- CLI exits with non-zero code on error
- Adapter errors wrapped with context (which API, what operation)

## Output Formatting
- Default: human-readable table/text output
- --json flag: structured JSON to stdout
- Errors always to stderr

## Dependency Management
- Minimal dependencies — prefer built-in Node.js APIs
- Pin major versions in package.json
- Audit before adding new packages

## Commit Discipline
- Atomic commits per logical change
- Conventional commit messages
- Tests must pass before commit
