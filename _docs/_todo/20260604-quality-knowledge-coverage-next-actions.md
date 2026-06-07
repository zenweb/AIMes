# 2026-06-04 Quality Knowledge Coverage Next Actions

## A-track

- 已完成：覆盖 `quality-knowledge-sample-sync.ts` 的灰度决策闭环：`decideQualityKnowledgeGrayRelease`、`approveQualityKnowledgeGrayReleaseExpansion`、`closeQualityKnowledgeGrayReviewIssueWithNegativeSample`、`reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment`。
- 已完成：覆盖资产治理输出，证明 `buildQualityKnowledgeAssetGovernanceRecords` 中样本、禁用、负样本、训练版本、反馈、回滚记录都有可追溯 audit/trace。
- 已完成：覆盖训练集生命周期，验证/发布/回滚状态必须生成对应 OTD evidence，且 active 推荐选择不能越过回滚或未批准影子灰度。
- 已完成：覆盖重新灰度发布分支，`grayPublishQualityKnowledgeNextTrainingSetVersion(..., 'reopened')` 必须使用重新发布 audit/trace，并让 active 选择不被旧回滚误排除。
- 已完成：覆盖 backend-first 读取分支，后端返回有效 evidence payload 时优先使用后端，坏 payload 时回退本地。
- 已完成：覆盖实验候选分支，负样本补丁、影子验证/发布候选必须输出正确 candidate type、audit/trace、nextAction 和 references。
- 已完成：覆盖坏数据/defaults 分支，灰度决策 defaults、reuse closure、recommendation feedback 的坏 payload 清洗和本地回退均有测试证据。
- 已完成：覆盖剩余 backend-first 分支，reuse draft、reuse closure、review queue、gray decision 的有效后端 payload 优先和坏 payload 本地回退均有测试证据。
- 已完成：覆盖组件层实验候选关键交互，R6/R7/R9 候选动作按钮具备动态 aria-label、动态文案和 emit 参数证据。
- 已完成：覆盖 `DocumentUpload.vue` 质量知识正式发布、灰度发布、回滚成功后的 history/status 展示，并让上传记录显示审计编号。
- 已完成：覆盖 `KnowledgeGovernancePanel.vue` 再训练候选生命周期按钮，审批、校验、补齐重校、发布、回滚均具备 aria-label 和 emit 参数证据。
- 已完成：修复真实浏览器 smoke 暴露的 offline preview backend-first 回退问题，质量知识 evidence 和 OTD evidence 遇到 SPA HTML/非数组 payload 时回退本地缓存。
- 已完成：修复知识治理 e2e 的 `Agent 治理` 过期 selector，当前 Admin UI 使用 `role=tab`。
- 已完成：修复 `QualityBoard.vue` 检验结果筛选无匹配时的空态提示，避免质量检验表格静默空白。
- 已完成：修复 `QualityBoard.vue` 根因分析关闭后无法重开缓存结果的问题，保持缓存复用且不重复请求后端。
- 已完成：修复 `QualityBoard.vue` 根因分析关闭按钮缺少辅助技术名称的问题。
- 已完成：修复 `QualityBoard.vue` 根因分析行按钮同名歧义的问题，每个按钮暴露目标检验编号。
- 已完成：修复 `QualityBoard.vue` 检验结果筛选控件缺少辅助技术名称的问题。
- 已完成：修复 `QualityBoard.vue` SPC 参数选择控件缺少辅助技术名称的问题。
- 继续覆盖真实浏览器 smoke，优先从已有失败证据出发，不盲目扩测。
- 继续避免 LoginPage 等已高覆盖组件插队，除非出现真实 correctness/UX 回归。

## B-track

- 仍需 GitHub repo / Actions run 证据、staging 镜像拉取、Attack Chain A/B/C、security signoff、首次灰度和 14 天观察。
- 已确认：`gh auth` 已登录 `zenweb` 且具备 `repo/workflow` scope；当前 remote 仍是腾讯工蜂，且 `gh repo view zenweb/AIMes` 仍无法解析仓库，Hosted CI 需要先提供真实 GitHub repo/remote 和 Actions run 证据。
