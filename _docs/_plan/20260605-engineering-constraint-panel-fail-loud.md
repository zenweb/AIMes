# 2026-06-05 EngineeringConstraintPanel Fail-loud Plan

## Success Criteria

- 工程约束证据写入失败时，不得出现未处理异常。
- 工程约束证据写入失败时，必须保留当前工程约束解释。
- 工程约束证据写入失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 工程约束证据写入成功时，仍以 `[role="status"]` 和 `aria-live="polite"` 宣告成功。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：按覆盖率杠杆选择 `EngineeringConstraintPanel.vue`，该组件原行覆盖率约 `34.78%`，且工程约束同步属于 AI 排产解释证据链关键动作。
- 已完成：新增红灯测试覆盖 `upsertOtdEvidenceChainRecord()` 失败时不得吞错或冒泡未处理异常。
- 已完成：修复工程证据同步分支，失败时显示 assertive alert，成功时保持 polite status。
- 已验证：目标 unit `1 file / 1 test passed`。
- 已验证：全量前端 unit coverage `82 files / 443 tests passed`；总行覆盖率 `75.70%`，`EngineeringConstraintPanel.vue` 行覆盖率 `100%`。
- 已验证：`npm run lint` 通过。
- 下一步：按“覆盖率最低且用户必经/高风险”原则重新排序；候选包括 `AuditDecisionReplayPanel.vue`、`QualityCapaTaskPanel.vue`、`RiskActionQueuePanel.vue` 或继续审计 `ChatPanel.vue` 未覆盖动作链。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
