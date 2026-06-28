# 2026-06-15 Agent Config Approval Merge Policy Coverage Issue

## Issue

Agent configuration approval synchronization had insufficient explicit evidence for local/backend merge precedence, quality experiment gate effectiveness, and unknown approval ID write prevention.

## Risk

Without focused evidence, regressions could:

- show stale backend evidence over a newer local decision;
- keep stale local evidence over a newer backend decision;
- relax the quality experiment expansion gate before explicit approval;
- fabricate an approval write for an unknown configuration ID.

## Resolution

Added focused tests to `src/frontend/tests/unit/agent-config-approval-sync.test.ts`.

## Evidence

- `agent-config-approval-sync.test.ts`: 10 passed.
- Focused `src/utils/agent-config-approval-sync.ts` coverage: 94.82% lines, 75.38% branches.
- Approval/admin/governance regression: 39 passed.

