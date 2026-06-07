# 2026-06-05 SkillMatrixPanel Sync Fail-loud Review

## Findings

- 审计结论：本片修复了人员技能/资质证据同步失败被静默放大的问题。
- 行为覆盖：`syncSkillEvidence()` 失败时，页面会保留人员技能矩阵和资格复核面板，不会因为单次证据写入失败而消失。
- Fail-loud 覆盖：失败分支通过 `role="alert"` 和 `aria-live="assertive"` 明确显示“人员证据同步失败”及底层错误原因。
- 业务风险收口：人员能力证据链同步失败现在可被用户及时看见，不会误导替班和停工复核判断。
- TDD 证据：新增 unit 直接验证同步失败提示节点存在，并断言失败消息文本。
- 验证证据：目标 unit `2 tests passed`；`npm run lint` 通过。

## Residual Risk

- `SkillMatrixPanel.vue` 仍可继续审计其它人员证据路径，但不应在已闭环的失败告警点上无限微切片。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据。
