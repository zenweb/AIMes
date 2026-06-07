# 2026-06-05 DocumentUpload Fail-loud Changelog

## Customer Import Evidence Refresh Slice

- 选片依据：按覆盖率杠杆从已收口的 `GanttChart.vue` / `ScheduleBoard.vue` 转向 `DocumentUpload.vue`；知识库入口是 POC 证据链和客户工单样例导入的用户关键路径。
- 问题：`readCustomerOrderImportEvidenceBackendFirst()` 后端刷新失败时使用 `catch(() => undefined)` 静默吞错。
- 风险：POC 数据缺口面板可能继续显示本地或空状态，用户不知道客户工单导入证据刷新失败，容易误判证据链已准备好。
- 修复：客户工单导入证据后端刷新失败时，通过全局 `error-msg` / `role="alert"` / `aria-live="assertive"` 显示失败原因，并保留本地导入样例状态。
- 行为保持：不改变生成客户工单导入样例、文件上传、质量知识治理和历史记录逻辑。
- 测试：新增 TDD 用例 `fails loud when customer order import evidence refresh fails and keeps the local sample state visible`，先红于页面没有 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/document-upload.test.ts` 通过，`1 file / 13 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 481 tests passed`，总行覆盖率 `76.86%`，`DocumentUpload.vue` 行覆盖率 `64.89%`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 知识库入口可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
