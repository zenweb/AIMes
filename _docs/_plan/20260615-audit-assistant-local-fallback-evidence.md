# 2026-06-15 Plan: Audit assistant local fallback evidence

## Objective

Harden the existing audit replay feature so assistant action evidence remains visible when backend assistant audit payloads are invalid.

## Scope

- In scope: `AuditDecisionReplayPanel.vue` assistant action audit loading and unit coverage.
- Out of scope: backend assistant evidence API changes, route navigation behavior, Docker/staging release evidence.

## Execution

1. Inspect the audit replay component and assistant action audit sync utility.
2. Add a failing test for invalid backend payload plus valid local assistant evidence.
3. Make the smallest loading-branch change that preserves local evidence while keeping the alert.
4. Ensure replay detail contains execution feedback for customer commitment assistant packages.
5. Run target tests and full frontend coverage.

## Success Criteria

- Invalid backend payload still surfaces a fail-loud alert.
- Local assistant action evidence becomes the selected replay chain.
- Target audit replay tests pass.
- Full frontend coverage passes.

## Result

- Target suite passed 31/31.
- Full frontend coverage passed 111 files / 964 tests.
