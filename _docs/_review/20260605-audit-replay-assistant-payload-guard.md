# 2026-06-05 Audit Replay Assistant Payload Guard Review

## Findings

- 审计结论：新增测试锁定助手动作审计坏载荷时的 fail-loud fallback。
- 行为覆盖：`readAssistantActionAuditsBackendFirst()` 返回非数组时，组件不得清空基础回放卡。
- 告警覆盖：页面必须显示 `助手动作审计加载失败` 和 `后端返回非数组审计载荷`。
- 可访问性覆盖：告警区域继续使用 `role="alert"` / `aria-live="assertive"`，适合审计证据缺失这类需要立即提示的风险。
- 本片没有修改生产代码；当前实现已经满足新增回归测试。

## Evidence

- 目标单测：`npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts`，13 tests passed。
- 全量 lint：`npm run lint` 通过。
- 全量前端覆盖率：`npm run test:unit:coverage`，489 tests passed。
- 覆盖率增量：`AuditDecisionReplayPanel.vue` 行覆盖率 `63.28% -> 63.98%`；分支覆盖率 `14.68% -> 14.86%`。

## Residual Risk

- `AuditDecisionReplayPanel.vue` 分支覆盖率仍低，后续应继续覆盖审计回放中的 backend-first 坏载荷、空载荷和优先选中策略。
- 本片不关闭 v1.0.0 的真实发布闸门。
