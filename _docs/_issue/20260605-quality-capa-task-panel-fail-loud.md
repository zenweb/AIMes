# 2026-06-05 QualityCapaTaskPanel Fail-loud Issues

## Fixed

- 问题：`QualityCapaTaskPanel.vue` 的“验证复用效果并回写”在 `verifyQualityKnowledgeReuseClosure()` 失败时会抛出未处理异常，没有明确告知用户回写失败。
- 风险：用户可能误判正式 CAPA 已验证，质量知识复用效果评分、后续训练集和审计回放缺少真实回写证据。
- 处理：捕获验证回写异常，保留待验证状态，并用 assertive alert 展示“质量知识复用效果验证失败”和失败原因。
- 问题：`QualityCapaTaskPanel.vue` 的“生成低分样本复核队列”在 `writeQualityKnowledgeReviewQueueRecord()` 失败时会抛出未处理异常，没有明确告知用户队列未生成。
- 风险：用户可能误判低分样本已进入人工复核队列，质量知识复用排序的禁用/再训练闭环缺少真实队列证据。
- 处理：捕获队列写入异常，不创建复核卡，并用 assertive alert 展示“低分样本复核队列生成失败”和失败原因。
- 问题：`QualityCapaTaskPanel.vue` 的“完成复核并禁用直接复用”在 `closeLowScoreQualityKnowledgeReviewQueueRecord()` 失败时会抛出未处理异常，没有明确告知用户队列仍未关闭。
- 风险：用户可能误判低分样本复核已完成，质量知识复用排序的禁用/再训练闭环缺少真实关闭证据。
- 处理：捕获队列关闭异常，保留 open 复核卡和关闭按钮，并用 assertive alert 展示“低分样本复核队列关闭失败”和失败原因。
- 问题：`QualityCapaTaskPanel.vue` 的“采纳发布推荐并回写效果”在 `acceptQualityKnowledgeRecommendation()` 失败时会抛出未处理异常，没有明确告知用户推荐未采纳。
- 风险：用户可能误判发布推荐已采纳并进入下一轮训练，质量知识复用排序和审计回放缺少真实采纳反馈。
- 处理：捕获推荐采纳异常，保留推荐卡和采纳按钮，不显示采纳反馈，并用 assertive alert 展示“质量知识发布推荐采纳失败”和失败原因。
- 问题：`QualityCapaTaskPanel.vue` 的“确认首件复核闭环”在 `closeAssistantRecoveryQualityAction()` 失败时会抛出未处理异常，没有明确告知用户质量责任动作未闭合。
- 风险：用户可能误判助手执行包首件复核已闭环，交期恢复执行包的质量责任和审计轨迹缺少真实闭环证据。
- 处理：捕获助手质量责任闭环异常，保留助手质量责任卡和确认按钮，并用 assertive alert 展示“助手执行包质量责任闭环失败”和失败原因。
- 验证：目标 unit `1 file / 9 tests passed`，全量前端 unit coverage `82 files / 448 tests passed`，lint 通过。

## Remaining

- `QualityCapaTaskPanel.vue` 行覆盖率当前为 `77.51%`；下一片建议按覆盖率杠杆转向更低覆盖且用户必经的组件，除非继续发现同质量闭环高风险缺口。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- 当前仓库 remote 仍指向腾讯工蜂；`gh` 已登录不等于 Hosted CI 已有真实证据。
