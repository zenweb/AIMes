# 2026-06-14 TODO - Purchase 详情陈旧告警清理后续

## 下一步
- 继续按“覆盖率增量 × 用户必经程度”选片，不继续重复打磨 Purchase 同一告警缺口。
- 候选优先看仍低于 80% 且用户关键的 `ReportBoard.vue`、`AuditDecisionReplayPanel.vue`、`AdminBoard.vue`。
- 下一片仍按 TDD：先写可失败 focused unit，再做最小修复，再补真实浏览器证据。

## 非当前阻塞
- 15 天灰度观察已按 owner 指令跳过/延期，不纳入当前推进路径。
- coverage 的 `--localstorage-file` warning 是脚本级清理项，未阻断本切片，但需要后续单独处理或在发布证据中明确说明。
