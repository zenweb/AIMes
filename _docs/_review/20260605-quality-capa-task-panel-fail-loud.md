# 2026-06-05 QualityCapaTaskPanel Fail-loud Review

## Findings

- 审计结论：本片修复质量知识复用效果验证回写失败时没有 fail-loud 的问题。
- 行为覆盖：`verifyQualityKnowledgeReuseClosure()` 抛错时，正式 CAPA 必须保持 `approved` 待验证状态，按钮仍显示“验证复用效果并回写”。
- 可访问性覆盖：失败提示必须使用 `role="alert"` 和 `aria-live="assertive"`，并包含后端/存储失败原因。
- 审计结论：本片同时修复低分样本复核队列生成失败时没有 fail-loud 的问题。
- 行为覆盖：`writeQualityKnowledgeReviewQueueRecord()` 抛错时，组件不得创建 `.low-score-review-card`，按钮仍显示“生成低分样本复核队列”。
- 可访问性覆盖：低分复核队列生成失败提示必须使用 `role="alert"` 和 `aria-live="assertive"`，并包含失败原因。
- 审计结论：本片同时修复低分样本复核队列关闭失败时没有 fail-loud 的问题。
- 行为覆盖：`closeLowScoreQualityKnowledgeReviewQueueRecord()` 抛错时，`.low-score-review-card` 必须保持 open，按钮仍显示“完成复核并禁用直接复用”。
- 可访问性覆盖：低分复核队列关闭失败提示必须使用 `role="alert"` 和 `aria-live="assertive"`，并包含失败原因。
- 审计结论：本片同时修复发布推荐采纳失败时没有 fail-loud 的问题。
- 行为覆盖：`acceptQualityKnowledgeRecommendation()` 抛错时，推荐卡必须保留，按钮仍显示“采纳发布推荐并回写效果”，且不得显示采纳反馈。
- 可访问性覆盖：发布推荐采纳失败提示必须使用 `role="alert"` 和 `aria-live="assertive"`，并包含失败原因。
- 审计结论：本片同时修复助手执行包质量责任闭环失败时没有 fail-loud 的问题。
- 行为覆盖：`closeAssistantRecoveryQualityAction()` 抛错时，助手质量责任卡必须保留，按钮仍显示“确认首件复核闭环”。
- 可访问性覆盖：助手执行包质量责任闭环失败提示必须使用 `role="alert"` 和 `aria-live="assertive"`，并包含失败原因。
- TDD 证据：新增用例先失败于 Vue unhandled error 与缺失 alert；修复后目标 unit 变绿。
- TDD 证据：新增低分复核队列用例先失败于 Vue unhandled error 与缺失 alert；修复后目标 unit 变绿。
- TDD 证据：新增低分复核队列关闭用例先失败于 Vue unhandled error 与缺失 alert；修复后目标 unit 变绿。
- TDD 证据：新增发布推荐采纳用例先失败于 Vue unhandled error 与缺失 alert；修复后目标 unit 变绿。
- TDD 证据：新增助手质量责任闭环用例先失败于 Vue unhandled error 与缺失 alert；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 9 tests passed`；全量前端 unit coverage `82 files / 448 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `75.90%`，`QualityCapaTaskPanel.vue` 行覆盖率 `77.51%`。

## Residual Risk

- 本片关闭“正式 CAPA 效果验证回写失败”“低分复核队列生成失败”“低分复核队列关闭失败”“发布推荐采纳失败”和“助手执行包质量责任闭环失败”五条质量闭环缺口。
- `QualityCapaTaskPanel.vue` 行覆盖率已提升到 `77.51%`，后续建议按覆盖率杠杆转向更低覆盖且用户必经的组件，除非继续发现同质量闭环的高风险缺口。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据。
