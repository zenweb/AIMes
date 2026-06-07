# 2026-06-05 Audit Replay Assistant Payload Guard Changelog

## Change

- 选片依据：按覆盖率增量选择审计主链路中的 `AuditDecisionReplayPanel.vue`；该组件行覆盖率约 `63%`，分支覆盖率约 `15%`，且直接影响 v1 审计可回放证据。
- 新增回归测试：助手动作审计 backend-first 返回非数组载荷时，基础回放卡必须保持可见。
- 新增断言：坏载荷原因必须通过 `.replay-sync-alert` 以 `role="alert"` / `aria-live="assertive"` 暴露。
- 本片只补测试证据，不新增功能，不修改生产实现。

## Validation

- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts`：1 file / 13 tests passed。
- `npm run lint`：通过。
- `npm run test:unit:coverage`：83 files / 489 tests passed。
- 覆盖率：总行覆盖率 `76.68%`；`AuditDecisionReplayPanel.vue` 行覆盖率 `63.98%`，分支覆盖率 `14.86%`。

## Release Boundary

- 本片属于 A-track 审计链路精品化。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍需 B-track 独立证据。
