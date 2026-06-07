# 2026-06-05 SkillMatrixPanel Sync Fail-loud Issues

## Fixed

- 问题：`SkillMatrixPanel.vue` 的证据同步按钮在 `upsertOtdEvidenceChainRecord()` 抛错时没有显式失败告警。
- 风险：人员技能、资质和排班证据链会被误判为已同步，影响替班建议、停工复核和生产放行判断。
- 处理：`syncSkillEvidence()` 增加 try/catch，失败时写入 `syncError`，并通过 assertive alert 显示“人员证据同步失败：...”
- 问题：同步失败时页面可见性没有稳定验证。
- 风险：即使逻辑失败被捕获，用户仍可能看不到可操作的失败信息。
- 处理：新增 unit 验证失败告警节点存在，且资格复核面板继续保留在页面上。

## Remaining

- `SkillMatrixPanel.vue` 仍可继续审计其它证据写入链路，但不应在已收口的失败告警点上重复切片。
- 本片未关闭 Hosted CI、staging、攻击链、安全签字、灰度和 14 天观察等 B-track 发布门。
