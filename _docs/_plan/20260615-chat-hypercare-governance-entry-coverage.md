# 2026-06-15 chat Hypercare governance entry coverage plan

## Success Criteria

- Pick the next component using the current coverage summary.
- Add a test for existing user-critical assistant behavior.
- Avoid production-code changes unless a real defect is found.
- Verify with targeted and full frontend coverage runs.

## Execution

1. Sort component coverage.
2. Select `ChatPanel.vue`.
3. Read existing tests and action-generation behavior.
4. Add Hypercare/governance action-entry coverage.
5. Run targeted and full coverage verification.

## Stop Condition

Stop after one high-leverage ChatPanel slice and documented verification. Do not claim release completion while PostgreSQL/staging is still FAIL.
