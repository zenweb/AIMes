# 2026-06-15 Review: Audit knowledge governance source route coverage

## Findings

- Fixed a real traceability gap: knowledge governance review replay cards showed audit id, trace id, version upgrade, validity window, and references, but did not expose a source-document route.
- The production change is narrow: only `mapKnowledgeGovernanceReviewToReplay` now supplies the existing `RouterLink` footer with `/knowledge` query context and `文档治理` label.
- Test intent is business-facing: if knowledge governance replay no longer links back to the reviewed source document, the regression test fails.

## Evidence

- Target regression test failed before the production change because `.trace-link` did not exist.
- Target audit replay test suite passed 30/30 after the mapper change.
- Full frontend coverage passed 963/963 tests.

## Residual Risk

- The route query is now emitted and labelled, but this unit test does not prove the `/knowledge` page consumes every query parameter.
- This frontend unit evidence does not replace PostgreSQL/staging or real browser release evidence.
