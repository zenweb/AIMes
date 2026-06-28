# 2026-06-15 Plan: chat action dedupe evidence

## Success Criteria
- Use current coverage evidence to pick a low-coverage user-critical component.
- Add focused evidence for an existing ChatPanel operator outcome.
- Avoid production changes unless the evidence fails.

## Steps
1. Recheck Docker briefly; stop if the Server is still unavailable.
2. Run full frontend unit coverage to refresh the routing signal.
3. Select ChatPanel because it is user-critical and low coverage.
4. Add a focused regression for duplicate engineering navigation actions.
5. Run targeted test, full ChatPanel test, and focused ChatPanel coverage.

## Stop Condition
- ChatPanel evidence passes and the environment limitation is recorded.
