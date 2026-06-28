# 2026-06-12 真实 dhtmlx 拖拽稳定性 Review

## 结论

- 本片未改排产业务逻辑，范围限定在真实浏览器证据稳定性。
- 原 flaky 的两个可复现来源已收敛：
  - 真实 dhtmlx 用例在默认 e2e 环境下可能误启用 demo hints，导致真实 `task_id` 不存在。
  - 急单建议点击与 dhtmlx 任务条拖拽存在命中/时序不稳定，首跑偶发没有触发建议或 PATCH。

## 审查点

- `scripts/e2e.mjs` 的自动环境推断仅在 grep 参数包含 `真实 dhtmlx` 时触发，不影响普通 demo smoke 或其它 E2E。
- `adoptRushSuggestion` 仍通过真实按钮点击和 UI 状态断言驱动，没有直接调用组件内部函数。
- `dragRushTask` 仍拖真实 dhtmlx DOM：`.gantt_task_line[task_id="dhtmlx-item-rush"] .gantt_task_content`，并验证轻量 marker 不存在。
- 点击重试是可观察的：最多 2 次真实点击，最终仍要求 UI 出现“急单插入重排建议”，不会吞掉失败。

## 剩余风险

- 这片只证明真实 dhtmlx 急单拖拽保存/失败两条路径更稳定；未声明整个排产页 E2E 套件无 flaky。
- 大目标仍未完成，发布闸门和 Sprint 0-3 全量审计仍需继续推进。
