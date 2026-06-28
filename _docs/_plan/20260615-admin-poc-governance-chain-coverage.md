# 2026-06-15 Plan: Admin POC governance chain coverage

## Success Criteria

- AdminBoard has direct unit evidence for the POC rollout -> pilot run -> Hypercare governance chain.
- The test proves audit IDs, batch/metric details, and Admin metrics render from backend-authoritative records.
- Target AdminBoard tests and full frontend coverage pass.
- No production behavior changes are introduced.

## Steps

1. Inspect AdminBoard and its existing tests.
2. Identify the uncovered but user-critical POC governance chain.
3. Make POC reader mocks controllable in `admin-board.test.ts`.
4. Add one focused behavior test for rollout, pilot run, and Hypercare evidence.
5. Run target and full frontend coverage verification.
6. Record changelog, review, todo, issue, and plan.

## Stop Condition

Stop after one high-value AdminBoard slice and verified coverage. Do not keep polishing AdminBoard unless the next coverage ranking still makes it the best leverage target.
