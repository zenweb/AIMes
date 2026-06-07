# 2026-06-05 QualityCapaTaskPanel Fail-loud Plan

## Success Criteria

- 质量知识复用效果验证回写失败时，不得出现未处理异常。
- 质量知识复用效果验证回写失败时，正式 CAPA 必须保持待验证状态。
- 质量知识复用效果验证回写失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 质量知识复用效果验证回写成功时，仍以 `[role="status"]` 和 `aria-live="polite"` 宣告评分回写结果。
- 低分样本复核队列生成失败时，不得出现未处理异常。
- 低分样本复核队列生成失败时，不能创建复核队列卡片。
- 低分样本复核队列生成失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 低分样本复核队列关闭失败时，不得出现未处理异常。
- 低分样本复核队列关闭失败时，必须保留 open 复核卡和关闭按钮。
- 低分样本复核队列关闭失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 发布推荐采纳失败时，不得出现未处理异常。
- 发布推荐采纳失败时，必须保留推荐卡和采纳按钮。
- 发布推荐采纳失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 助手执行包质量责任闭环失败时，不得出现未处理异常。
- 助手执行包质量责任闭环失败时，必须保留助手质量责任卡和确认按钮。
- 助手执行包质量责任闭环失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：按覆盖率杠杆选择 `QualityCapaTaskPanel.vue`，该组件行覆盖率约 `61.46%`，且质量知识复用效果验证属于质量 CAPA 闭环关键动作。
- 已完成：新增红灯测试覆盖 `verifyQualityKnowledgeReuseClosure()` 失败时不得吞错或冒泡未处理异常。
- 已完成：修复复用效果验证分支，失败时显示 assertive alert，成功时保持 polite status。
- 已完成：新增红灯测试覆盖 `writeQualityKnowledgeReviewQueueRecord()` 失败时不得吞错或冒泡未处理异常。
- 已完成：修复低分复核队列生成分支，失败时显示 assertive alert，不创建复核卡。
- 已完成：新增红灯测试覆盖 `closeLowScoreQualityKnowledgeReviewQueueRecord()` 失败时不得吞错或冒泡未处理异常。
- 已完成：修复低分复核队列关闭分支，失败时显示 assertive alert，保留 open 复核卡和关闭按钮。
- 已完成：新增红灯测试覆盖 `acceptQualityKnowledgeRecommendation()` 失败时不得吞错或冒泡未处理异常。
- 已完成：修复发布推荐采纳分支，失败时显示 assertive alert，保留推荐卡和采纳按钮。
- 已完成：新增红灯测试覆盖 `closeAssistantRecoveryQualityAction()` 失败时不得吞错或冒泡未处理异常。
- 已完成：修复助手执行包质量责任闭环分支，失败时显示 assertive alert，保留助手质量责任卡和确认按钮。
- 已验证：目标 unit `1 file / 9 tests passed`。
- 已验证：全量前端 unit coverage `82 files / 448 tests passed`；总行覆盖率 `75.90%`，`QualityCapaTaskPanel.vue` 行覆盖率 `77.51%`。
- 已验证：`npm run lint` 通过。
- 下一步：按覆盖率杠杆重新排序，优先转向更低覆盖且用户必经的组件，除非继续发现同质量闭环高风险缺口。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
