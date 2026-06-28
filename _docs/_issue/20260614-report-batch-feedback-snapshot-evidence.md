# 2026-06-14 Issue - 报表缺少批量采纳 snapshot 专项证据

## 问题
- 排产批量对比采纳已写入 `aimes_schedule_feedback_snapshot`。
- 报表中心虽已有本地 schedule feedback fallback，但缺少针对 `已采纳批量对比方案` 的专项单测和真实 Chromium 证据。

## 影响
- “刷新后报表/OTD 复盘能否追溯批量采纳”缺少稳定回归保护。
- 后续改动可能误伤批量采纳字段映射，而普通 Agent 推荐 snapshot 测试不一定能发现。

## 修复
- 新增单测覆盖 `已采纳批量对比方案`、`批量对比采纳`、`综合平衡` 和 `TRACE-SCH-FEEDBACK-BATCH-balanced`。
- 新增真实 Chromium 场景，写入 localStorage snapshot 后刷新报表页，验证 OTD 证据链卡片可见。

## 剩余风险
- 钻取详情仍复用通用 OTD evidence 映射文案；如要更贴合批量采纳，需要后续独立切片。
