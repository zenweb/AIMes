# 2026-06-05 SkillMatrixPanel Sync Fail-loud Plan

## Success Criteria

- 人员技能/资质证据同步失败时，不能静默吞错或让用户误判为已成功。
- 失败必须通过 assertive alert 明确显示原因。
- 页面必须保留人员技能矩阵和资格复核面板，便于重试和继续判断。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：为 `SkillMatrixPanel.vue` 的证据同步失败增加显式错误区域。
- 已完成：新增目标 unit，验证 `upsertOtdEvidenceChainRecord()` 抛错时会显示失败原因。
- 已完成：目标 unit 通过，`2 tests passed`。
- 已完成：`npm run lint` 通过。
- 下一步：继续按覆盖率杠杆选择下一个用户关键路径，不继续在同一失败点上打磨。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片 unit 结果替代发布闸门证据。
