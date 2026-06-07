# 2026-06-05 SkillMatrixPanel Sync Fail-loud Changelog

## Personnel Evidence Sync Slice

- 选片依据：继续按覆盖率杠杆推进用户关键路径，`SkillMatrixPanel.vue` 属于人员资质与替班闭环入口，和生产开工阻断直接相关。
- 问题：`syncSkillEvidence()` 在 `upsertOtdEvidenceChainRecord()` 抛错时缺少显式错误处理，失败会被事件处理链打断，页面没有稳定的失败告警。
- 风险：人员技能/资质证据链同步失败后，用户可能误以为证据已经进入 OTD 复盘，导致替班、停工复核和生产放行判断失真。
- 修复：为同步失败增加 `role="alert"` / `aria-live="assertive"` 的显式错误区域，并在 catch 分支保留面板可见状态。
- 行为保持：不改替班建议生成、停工复核流转、放行逻辑和现有证据写入字段。
- 测试：新增目标 unit，覆盖证据链写入失败时必须显示失败原因，并确认资格复核面板仍保留在页面上。
- 验证：`npm run test:unit -- tests/unit/skill-matrix-panel.test.ts` 通过，`2 tests passed`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 人员能力证据链可靠性修复。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测结果替代。
