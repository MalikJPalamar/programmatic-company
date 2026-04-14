# BuilderBee CLI Development Methodology v1.0

## Command Implementation Pattern
1. Define command interface (flags, args, output shape)
2. Write unit test with mocked GHL response
3. Implement adapter method
4. Implement command handler
5. Verify: test passes, --json output validates

## GHL Adapter Pattern
- Single GHLAdapter class wraps all GHL API calls
- Methods return typed domain objects (not raw API responses)
- Pagination handled internally, consumer gets full result set
- Rate limiting and retry built into adapter

## Testing
- Mock GHL responses in tests/fixtures/
- Test both human and --json output modes
- Test error cases (API down, invalid credentials, not found)
