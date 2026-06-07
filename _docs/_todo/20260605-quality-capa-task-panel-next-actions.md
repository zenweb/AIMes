# 2026-06-05 QualityCapaTaskPanel Next Actions

## Done

- 已完成：`QualityCapaTaskPanel.vue` 质量知识复用效果验证回写失败时 fail loud，避免正式 CAPA 待验证状态被未处理异常掩盖。
- 已完成：新增目标测试覆盖 `verifyQualityKnowledgeReuseClosure()` 失败时保留待验证状态、显示 assertive alert 和失败原因。
- 已完成：`QualityCapaTaskPanel.vue` 低分样本复核队列生成失败时 fail loud，避免复核队列未生成却只表现为未处理异常。
- 已完成：新增目标测试覆盖 `writeQualityKnowledgeReviewQueueRecord()` 失败时不创建复核卡、显示 assertive alert 和失败原因。
- 已完成：`QualityCapaTaskPanel.vue` 低分样本复核队列关闭失败时 fail loud，避免复核队列仍 open 却只表现为未处理异常。
- 已完成：新增目标测试覆盖 `closeLowScoreQualityKnowledgeReviewQueueRecord()` 失败时保留 open 复核卡、显示 assertive alert 和失败原因。
- 已完成：`QualityCapaTaskPanel.vue` 发布推荐采纳失败时 fail loud，避免推荐未采纳却只表现为未处理异常。
- 已完成：新增目标测试覆盖 `acceptQualityKnowledgeRecommendation()` 失败时保留推荐卡和采纳按钮、显示 assertive alert 和失败原因。
- 已完成：`QualityCapaTaskPanel.vue` 助手执行包质量责任闭环失败时 fail loud，避免首件复核未闭环却只表现为未处理异常。
- 已完成：新增目标测试覆盖 `closeAssistantRecoveryQualityAction()` 失败时保留助手质量责任卡和确认按钮、显示 assertive alert 和失败原因。
- 已完成：目标 unit、全量前端 coverage 和 lint 验证。

## Continue

- 继续：按覆盖率杠杆重新排序，优先转向更低覆盖且用户必经的组件；当前候选包括 `ChatPanel.vue`、`AuditDecisionReplayPanel.vue`、`RiskActionQueuePanel.vue`。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 当前 `gh` 登录和 Docker 可用，但仓库 remote 未绑定 GitHub，Hosted CI 仍不能关闭。
