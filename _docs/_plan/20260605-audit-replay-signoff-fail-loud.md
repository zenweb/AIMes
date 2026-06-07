# 2026-06-05 Audit Replay Signoff Fail-loud Plan

## Success Criteria

- POC 复盘签署 malformed payload 不能让审计回放组件崩溃。
- 同一失败必须通过 assertive alert 明确显示失败原因。
- 基础 AI 建议回放卡必须保持可见，避免单条发布证据坏载荷拖垮整个审计面板。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：新增红灯测试覆盖 POC 复盘签署缺少 `evidenceBatches` / `reviewers` 时必须 fail loud。
- 已完成：修复 `AuditDecisionReplayPanel.vue`，在读取 POC 复盘签署后校验 replay 必需字段。
- 已验证：目标 unit `1 file / 12 tests passed`。
- 已验证：全量前端 unit coverage `82 files / 483 tests passed`；总行覆盖率 `76.89%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `65.32%`。
- 已验证：`npm run lint` 通过。
- 下一步：继续按覆盖率杠杆选择下一条用户关键路径。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
- 当前 `gh` 已登录；GitHub repo/remote 仍需用户确认创建或提供。
