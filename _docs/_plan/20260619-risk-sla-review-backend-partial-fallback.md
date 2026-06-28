# 2026-06-19 Plan - Risk SLA Review Backend Partial Fallback

## Goal
Keep risk SLA review affected orders, action owners, evidence ids, and audit metadata intact when backend latest-record reads receive partial payloads.

## Steps
1. Inspect the current reader and confirm local storage already has a complete-record guard.
2. Add a failing test where backend returns a partial latest review package.
3. Apply the same guard to the backend result before returning it.
4. Run the focused sync test and adjacent risk queue / schedule filtered tests.

## Stop Condition
- Partial backend review packages cannot replace complete local evidence.
- Complete backend review packages remain valid.
- Targeted tests pass and filtered verification scope is explicit.
