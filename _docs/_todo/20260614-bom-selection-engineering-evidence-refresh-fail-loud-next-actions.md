# 2026-06-14 TODO - BOM 选择工程证据刷新 Fail-Loud 后续

## 下一步
- 继续按“覆盖率增量 × 用户必经程度”选片，不继续压榨已闭环的 BOM 同一缺口。
- 优先查看仍低于 80% 且用户关键的现有组件真实弱点，例如 `PurchaseBoard.vue`、`ReportBoard.vue`、`AuditDecisionReplayPanel.vue`、`AdminBoard.vue`。
- 下一片仍按 TDD：先写可失败的 focused unit，再做最小修复，再补真实浏览器证据。

## 非当前阻塞
- 15 天灰度观察已按 owner 指令跳过/延期，不纳入当前推进路径。
- coverage 的 `--localstorage-file` warning 是脚本级清理项，未阻断本切片，但不能在最终发布证据里静默忽略。
