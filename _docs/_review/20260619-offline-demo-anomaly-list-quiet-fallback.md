# 2026-06-19 Review: Offline Demo Anomaly List Quiet Fallback

## Findings
- No blocking finding in the anomaly-list slice after verification.
- The implementation filters only `OfflineDemoApiError`; the existing ordinary failure test still proves real list failures surface as user-visible alerts.

## Reviewed Scope
- `src/frontend/src/components/anomaly/AnomalyBoard.vue`
- `src/frontend/tests/unit/anomaly-board.test.ts`

## Verification
- Focused offline demo test failed before the component change and passed after the change.
- Ordinary anomaly-list failure test passed.
- Full anomaly board test suite passed.
- Offline demo regression bundle passed.
- Production build passed.
- Real browser anomaly route passed with no backend skip text and no alert.

## Residual Risk
- Several other offline demo routes still leak backend skip text. They were identified but not modified in this slice to keep the change scoped.
