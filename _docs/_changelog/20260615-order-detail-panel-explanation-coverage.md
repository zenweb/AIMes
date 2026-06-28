# 2026-06-15 Order Detail Panel Explanation Coverage

## Change

- Added focused tests for `OrderDetailPanel.vue`.
- Locked existing work-order detail behavior:
  - selected work order detail remains an accessible dialog.
  - close button emits `close`.
  - custom task-level scheduling explanation renders reason, risk, alternative, and evidence cards.
  - actual start time is shown when present.
  - empty state is announced politely when no work order is selected.
  - unknown backend status values fall back to raw status text instead of rendering blank.

## Evidence

```powershell
npm run test:unit -- tests/unit/order-detail-panel.test.ts
# 1 file passed, 5 tests passed

npm run test:unit:coverage -- tests/unit/order-detail-panel.test.ts --coverage.include=src/components/schedule/OrderDetailPanel.vue
# OrderDetailPanel.vue statements 100%, branches 93.44%, functions 100%, lines 100%
```

