# 2026-06-16 Chat Shopfloor Incident Navigation Coverage Plan

## Objective

Finish the selected high-value `ChatPanel.vue` navigation branch by covering anomaly center and production reporting entry points.

## Success Criteria

- A shopfloor incident request exposes `打开异常中心`.
- The same request exposes `打开生产报工`.
- Each action appears once.
- Targeted chat tests and coverage pass.
- Related routing/user-state regression passes.
- Full frontend coverage passes.

## Outcome

- Success criteria met.
- Chat targeted lines improved to `86.17%`.
- Full frontend coverage remains green.

## Next Slice

Move away from `ChatPanel.vue` unless a remaining assistant behavior is explicitly selected. Prefer the next low/medium-coverage user-critical component such as `BomBoard.vue`, `PurchaseBoard.vue`, or `ProductionBoard.vue`.
