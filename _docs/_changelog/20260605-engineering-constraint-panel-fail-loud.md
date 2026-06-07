# 2026-06-05 EngineeringConstraintPanel Fail-loud Changelog

## Engineering Evidence Sync Failure Slice

- 选片依据：按覆盖率杠杆重新排序，`EngineeringConstraintPanel.vue` 之前行覆盖率约 `34.78%`，低于多数主组件；工程约束同步是 AI 排产解释写入 OTD 复盘证据链的关键动作。
- 问题：点击“同步工程证据”后，如果 `upsertOtdEvidenceChainRecord()` 写入失败，异常会冒泡为 Vue unhandled error，页面没有明确失败提示。
- 风险：用户无法判断 BOM、工艺路线、质量门和技能资质约束是否进入 OTD 证据链，可能误以为工程约束已经可在报表中心和审计回放核对。
- 修复：工程证据同步写入失败时捕获异常，把 `.sync-note` 切换为 `role="alert"` / `aria-live="assertive"`，显示“工程约束证据同步失败”和具体失败原因；当前页面仍保留工程约束解释。
- 行为保持：同步成功时仍写入统一证据链，并以 `role="status"` / `aria-live="polite"` 宣告成功。
- 测试：新增 TDD 用例 `announces engineering evidence sync failures as an assertive alert`，先红于 Vue unhandled error 与缺失 `role="alert"`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/engineering-constraint-panel.test.ts` 通过，`1 file / 1 test passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 443 tests passed`，总行覆盖率 `75.70%`，`EngineeringConstraintPanel.vue` 行覆盖率 `100%`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 前端排产解释可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
