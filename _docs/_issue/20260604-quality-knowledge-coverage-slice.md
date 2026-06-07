# 2026-06-04 Quality Knowledge Coverage Slice Issues

## Resolved

- 问题：`quality-knowledge-sample-sync.ts` 覆盖率只有 `14.10%`，但它负责质量知识推荐版本选择、灰度/回滚/影子发布治理，属于业务关键路径。
- 风险：灰度版本被回滚后仍被推荐，或影子灰度未审批就进入优先推荐，会让质量知识推荐越过治理闸门。
- 处理：新增两条单测，锁定回滚排除与影子灰度审批扩大两个业务不变量。

## Remaining

- 已继续覆盖灰度决策、复核问题单关闭/重开证据闭环；`quality-knowledge-sample-sync.ts` 行覆盖率提升到 `41.23%`。
- 已覆盖 `buildQualityKnowledgeAssetGovernanceRecords` 的 audit/trace 输出完整性；`quality-knowledge-sample-sync.ts` 行覆盖率提升到 `60.04%`。
- 已覆盖训练集验证/发布/回滚生命周期函数自身的 OTD evidence 写入；`quality-knowledge-sample-sync.ts` 行覆盖率提升到 `65.59%`。
- 已覆盖重新灰度发布分支；`quality-knowledge-sample-sync.ts` 行覆盖率提升到 `67.94%`。
- 已覆盖 backend-first 读取分支；`quality-knowledge-sample-sync.ts` 行覆盖率提升到 `68.37%`。
- 已覆盖实验候选分支，验证 R6 负样本补丁、R7 影子验证/发布的 candidate type、audit/trace、nextAction 和 references；`quality-knowledge-sample-sync.ts` 行覆盖率提升到 `70.08%`。
- 已覆盖 reuse closure / recommendation feedback 坏 payload 清洗、灰度决策 defaults 持久化、坏后端 feedback 回退本地；`quality-knowledge-sample-sync.ts` 行覆盖率提升到 `73.62%`。
- 已覆盖 reuse draft / reuse closure / review queue / gray decision 的 backend-first 有效后端优先与坏 payload 本地回退；`quality-knowledge-sample-sync.ts` 行覆盖率提升到 `76.79%`。
- 已覆盖 `KnowledgeGovernancePanel.vue` 实验候选按钮交互，R6/R7/R9 动作具备动态 aria-label、动态文案和 emit 参数证据；组件行覆盖率提升到 `55.88%`。
- 已覆盖 `DocumentUpload.vue` 质量知识正式发布、灰度发布、回滚成功路径，并修复上传记录未展示审计编号的问题；组件行覆盖率提升到 `64.36%`。
- 已覆盖 `KnowledgeGovernancePanel.vue` 再训练候选生命周期按钮，审批、校验、补齐重校、发布、回滚均具备 aria-label 和 emit 参数证据；组件行覆盖率提升到 `76.47%`。
- 已修复真实浏览器 smoke 暴露的 backend-first offline preview 问题：Nuxt preview 返回 SPA HTML 时，质量知识 evidence 和 OTD evidence 读取会类型门禁并回退本地缓存。
- 已修复知识治理 e2e 过期选择器：`Agent 治理` 当前是 `tab` 而不是 `button`。
- 已修复 `QualityBoard.vue` 检验结果筛选空态：有检验数据但筛选无匹配时会显示 `暂无匹配检验记录`，不再呈现空白表格。
- 已修复 `QualityBoard.vue` 根因分析缓存后无法重开：关闭分析面板后可再次点击同一行重开缓存结果，且不重复请求后端分析。
- 已修复 `QualityBoard.vue` 根因分析关闭按钮缺少辅助技术名称：关闭控件新增 `aria-label="关闭根因分析"`。
- 已修复 `QualityBoard.vue` 根因分析行按钮同名歧义：每个按钮新增 `查看 {inspectionId} 根因分析` 的动态 `aria-label`。
- 已修复 `QualityBoard.vue` 检验结果筛选控件缺少辅助技术名称：筛选下拉框新增 `aria-label="筛选检验结果"`。
- 已修复 `QualityBoard.vue` SPC 参数选择控件缺少辅助技术名称：参数下拉框新增 `aria-label="选择 SPC 参数"`。
- 后续仍应继续覆盖其他真实浏览器层 smoke 和发布闸门外部证据。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、人工攻击链验证、安全签字和 14 天灰度观察。
- GitHub CLI 已登录 `zenweb` 且具备 `repo/workflow` scope；当前 remote 仍为腾讯工蜂，且 `gh repo view zenweb/AIMes` 仍无法解析仓库，Hosted CI 证据仍需真实 GitHub repo/remote 和 Actions run。
