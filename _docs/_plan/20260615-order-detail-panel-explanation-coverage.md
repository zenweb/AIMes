# 2026-06-15 Order Detail Panel Explanation Coverage Plan

## Goal

Improve evidence depth for the existing scheduling work-order detail panel.

## Success Criteria

1. The selected work order detail remains an accessible dialog.
2. The panel emits close from the named close action.
3. Custom task-level explanation renders reason, risk, alternative, and evidence items.
4. Empty and error/loading states remain announced.
5. Unknown backend status values remain visible.

## Result

- `order-detail-panel.test.ts`: 5/5 passed.
- `OrderDetailPanel.vue` focused coverage: statements 100%, branches 93.44%, functions 100%, lines 100%.

