# 2026-06-15 Plan: Audit config approval local fallback evidence

## Objective

Harden the existing audit replay feature so configuration approval evidence remains visible when backend approval payloads are invalid.

## Scope

- In scope: `AuditDecisionReplayPanel.vue` configuration approval loading and unit coverage.
- Out of scope: backend governance evidence API changes, configuration approval storage changes, Docker/staging release evidence.

## Execution

1. Inspect the audit replay component and agent configuration approval sync utility.
2. Add a failing test for invalid backend payload plus valid local configuration approval evidence.
3. Make the smallest loading-branch change that preserves local evidence while keeping the alert.
4. Run target tests and full frontend coverage.
5. Record changelog, review, todo, issue, and plan evidence.

## Success Criteria

- Invalid backend payload still surfaces a fail-loud alert.
- Local configuration approval evidence remains visible in the approval lane and replay detail.
- Target audit replay tests pass.
- Full frontend coverage passes.

## Result

- Target suite passed 32/32.
- Full frontend coverage passed 111 files / 965 tests.
