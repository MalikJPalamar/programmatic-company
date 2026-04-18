# AOB CLI Development Methodology v1.0

## Multi-System Fusion Pattern
1. Define unified domain model (UnifiedStudent, etc.)
2. Implement adapter per external system (CRMAdapter, PaymentAdapter, etc.)
3. Build fusion service that calls adapters in parallel with graceful fallback
4. Write CLI command that delegates to fusion service
5. Test: mock each adapter independently, test fusion with all mocks

## Adapter Swap Pattern
- Interface defined in types.ts
- Today: OntraportAdapter implements CRMAdapter
- Migration: GHLAdapter implements CRMAdapter — one line change
- Consumer code never touches adapter internals

## Error Handling
- Adapter failures: wrapped with context (which system, what operation)
- Fusion failures: degrade gracefully (missing Stripe data = paymentStatus: 'none')
- CLI: structured error JSON to stderr, non-zero exit code
