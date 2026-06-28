# 2026-06-19 Review: Offline Demo BOM List Quiet Fallback

## Findings
- No blocking finding in the BOM-list slice after verification.
- The implementation filters only `OfflineDemoApiError`; the existing ordinary BOM-list failure test still proves real list failures surface as user-visible alerts.

## Reviewed Scope
- `src/frontend/src/components/bom/BomBoard.vue`
- `src/frontend/tests/unit/bom-board.test.ts`

## Verification
- Focused offline demo test failed before the component change and passed after the change.
- Ordinary BOM-list failure test passed.
- Full BOM board test suite passed.
- Offline demo regression bundle passed.
- Production build passed.
- Real browser BOM route passed with no backend skip text, no BOM-list failure alert, and demo BOM records visible.

## Residual Risk
- This slice covers startup BOM list loading. Detail, explosion, and evidence-write operations still intentionally fail loud for real failures.
- Several other offline demo routes still leak backend skip text. They were not modified in this slice to keep the change scoped.
