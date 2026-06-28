# 2026-06-15 Plan: Audit knowledge governance source route coverage

## Objective

Improve the existing audit replay feature by closing the source-document traceability gap for knowledge governance review records.

## Scope

- In scope: `AuditDecisionReplayPanel.vue` knowledge governance replay mapping and its unit test.
- Out of scope: new knowledge governance features, route page behavior changes, Docker/staging release evidence.

## Execution

1. Read the audit replay component, current unit tests, and knowledge governance sync record shape.
2. Add a failing test that proves knowledge governance replay needs a labelled source-document link.
3. Implement the smallest mapper change needed to reuse the existing trace footer `RouterLink`.
4. Run target audit replay tests and full frontend coverage.
5. Record changelog, review, todo, issue, and plan evidence.

## Success Criteria

- The test fails before production code changes because the source-document link is missing.
- The mapper emits `/knowledge` route metadata for knowledge governance replay records.
- Target audit replay tests pass.
- Full frontend coverage passes.

## Result

- Target test passed 30/30 after the mapper change.
- Full frontend coverage passed 111 files / 963 tests.
