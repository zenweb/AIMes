# 2026-06-04 Quality Knowledge Coverage Slice Review

## Review

- 审计结论：本片没有继续精修已 100% 覆盖的 LoginPage，而是转向低覆盖且质量推荐链路关键的 `quality-knowledge-sample-sync.ts`。
- 行为覆盖：新增测试证明已回滚的 `gray_published` 训练版本不会继续作为 active/prioritized 推荐；影子灰度版本在未获已批准扩大决策前不会进入优先推荐。
- 覆盖率证据：目标文件行覆盖率 `14.10% -> 23.50%`；总行覆盖率 `66.79% -> 67.29%`。
- 验证边界：本片只补质量知识推荐版本选择门禁测试，不关闭 Hosted CI、staging、Attack Chain、security signoff、gray observation 等 B-track release gate。

## Gray Decision Closure Review

- 审计结论：第二片继续加强同一精品功能链路，覆盖质量知识灰度决策从监控、扩大、人工批准、回滚、复核问题单关闭/重开的证据状态。
- 行为覆盖：`decideQualityKnowledgeGrayRelease` 的 expanded 决策必须先保持 `approvalStatus=pending`；`approveQualityKnowledgeGrayReleaseExpansion` 才能把 OTD 决策证据从 `ready` 推到 `closed`。
- 行为覆盖：rolled-back 决策必须带 `rollbackTargetVersion=QK-TRAIN-20260521-R2` 并打开复核问题单；负样本关闭写 `closed/复核关闭`，范围调整重开写 `ready/重开校验`。
- 覆盖率证据：目标文件行覆盖率已到 `41.23%`；总行覆盖率已到 `68.33%`。
- 验证边界：仍未声明 B-track release gate 关闭；这些测试只证明 A-track 质量知识治理链路更强。

## Asset Governance Traceability Review

- 审计结论：第三片覆盖 `buildQualityKnowledgeAssetGovernanceRecords` 的核心输出，不只看列表存在，而是检查每个治理资产都有可追溯 `auditId` / `traceId`。
- 行为覆盖：样本入库使用样本 audit/trace；低分复核关闭后的禁用和负样本使用 decision audit/trace；再训练候选使用发布训练集 publish audit/trace。
- 行为覆盖：推荐采纳使用 feedback audit/trace；下一轮训练集使用灰度训练集 publish audit/trace；实验负样本和风险阈值使用回滚决策 audit/trace。
- 覆盖率证据：目标文件行覆盖率已到 `60.04%`；总行覆盖率已到 `69.32%`。
- 验证边界：资产治理测试仍属于 A-track 前端质量证据；B-track hosted CI/staging/manual gate 仍需真实外部证据。

## Retraining Lifecycle Evidence Review

- 审计结论：第四片覆盖训练集生命周期 OTD evidence，避免质量知识训练版本只改变状态却缺少审计链。
- 行为覆盖：发布前校验失败会保留审批证据为 `active/审批保留 / 校验未通过`，并写入 `知识再训练校验` active evidence。
- 行为覆盖：重新校验通过会写入 `知识再训练校验通过` ready evidence；发布后审批、校验通过和发布 evidence 均为 closed。
- 行为覆盖：从失败校验版本回滚会把审批和失败校验证据转 closed，并写入 `知识再训练回滚` closed evidence。
- 覆盖率证据：目标文件行覆盖率已到 `65.59%`；总行覆盖率已到 `69.62%`。
- 验证边界：本片没有伪造真实灰度观察或安全签字，只证明 A-track 前端证据链行为。

## Reopened Gray Republish Review

- 审计结论：第五片覆盖重新灰度发布分支，锁定“范围调整重开校验后重新发布的 R3 不应继续被旧回滚决策排除”这个质量推荐不变量。
- 行为覆盖：reopened 校验通过使用 scope revalidation audit/trace；reopened 灰度发布使用 R3 gray republish audit/trace，并写入 closed 发布证据。
- 行为覆盖：`selectActiveQualityKnowledgeRecommendationVersion` 与 `selectPrioritizedQualityKnowledgeRecommendationVersion` 在收到 `reviewIssueStatus=prevalidation_reopened` 的旧 rollback decision 时，仍选择带 republish evidence 的 R3。
- 覆盖率证据：目标文件行覆盖率已到 `67.94%`；总行覆盖率已到 `69.74%`。
- 验证边界：这仍是 A-track 单元证据；真实首次灰度和 14 天观察仍属于 B-track。

## Backend-first Evidence Read Review

- 审计结论：第六片覆盖质量知识 backend-first 读取分支，验证后端证据优先级和坏数据回退都明确。
- 行为覆盖：后端返回有效 `QualityKnowledgeSample` envelope 时，读取结果使用后端 payload，不被本地旧缓存覆盖。
- 行为覆盖：后端返回结构不完整的 `QualityKnowledgeRetrainingVersion` payload 时，读取结果过滤坏 payload 并回退本地有效训练版本。
- 覆盖率证据：目标文件行覆盖率已到 `68.37%`；总行覆盖率已到 `69.76%`。
- 验证边界：本片不证明后端 API 真实可用，只证明前端读取策略和坏数据防护。

## Experiment Candidate Evidence Review

- 审计结论：第七片覆盖推荐实验候选证据链，锁定 R5 回滚后 R6 补样、R7 影子验证/影子灰度发布的治理不变量。
- 行为覆盖：未合并 R6 时输出 `negative_sample_patch`、`guarded`、`4 / 5 条`、补 1 条跨线负样本和回滚/反馈 references。
- 行为覆盖：R6 合并后候选切换到 merge approval audit/trace；R7 影子发布后候选切换到 publish audit/trace，并保留“等待质量主管确认”的下一步。
- 覆盖率证据：目标文件行覆盖率已到 `70.08%`；总行覆盖率已到 `69.85%`。
- 验证边界：本片仍是 A-track 单元证据，不替代真实灰度审批、Hosted CI、staging 或 14 天观察。

## Bad Payload Defaults Review

- 审计结论：第八片覆盖质量知识坏数据和 legacy defaults 防护，避免不完整 closure/feedback 或旧灰度决策 payload 污染治理输出。
- 行为覆盖：`QualityKnowledgeReuseClosure` 与 `QualityKnowledgeRecommendationFeedback` 必须带非空动作和指标；空动作/指标记录会被过滤并回写本地缓存。
- 行为覆盖：旧灰度决策缺少 `releaseCycleLabel`、`releaseAuditId`、`releaseTraceId`、`releaseScopeLabel` 时会补默认字段并持久化。
- 行为覆盖：后端返回结构不完整的 recommendation feedback payload 时，backend-first 读取回退本地有效反馈。
- 覆盖率证据：目标文件行覆盖率已到 `73.62%`；总行覆盖率已到 `70.04%`。
- 验证边界：本片不证明后端服务真实可用，也不关闭 Hosted CI/staging/manual gate。

## Backend-first Governance Payload Review

- 审计结论：第九片覆盖剩余质量知识治理 payload 的 backend-first 读取证据，证明后端优先和坏数据回退不是只对 sample/retraining 生效。
- 行为覆盖：有效后端 `QualityKnowledgeReuseDraft`、`QualityKnowledgeReuseClosure`、`QualityKnowledgeReviewQueue` payload 会优先返回，且不覆盖本地缓存。
- 行为覆盖：有效后端 legacy `QualityKnowledgeGrayReleaseDecision` payload 会补齐 release cycle/audit/trace/scope defaults。
- 行为覆盖：后端返回结构不完整的 review queue payload 时，读取结果回退本地有效复核记录。
- 覆盖率证据：目标文件行覆盖率已到 `76.79%`；总行覆盖率已到 `70.17%`。
- 验证边界：本片仍是前端读取策略单元证据；真实后端 API、Hosted CI、staging 和人工 release gate 仍需外部证据。

## Knowledge Governance Experiment Actions Review

- 审计结论：第十片覆盖质量知识治理面板的实验候选动作区，补上用户点击 R6/R7/R9 候选动作时的组件层证据。
- 行为覆盖：负样本合并按钮带 `合并 R10 负样本：...` aria-label，并 emit `quality-experiment-candidate-merged` candidate id。
- 行为覆盖：影子验证按钮带 `运行 R7 影子验证：...` aria-label，并 emit `quality-experiment-shadow-validated` candidate id。
- 行为覆盖：影子灰度发布按钮带 `发布 R9 影子灰度：...` aria-label，并 emit `quality-experiment-shadow-gray-published` retraining version id；可见按钮和状态说明改为动态候选版本。
- 覆盖率证据：`KnowledgeGovernancePanel.vue` 行覆盖率已到 `55.88%`；总行覆盖率已到 `70.43%`。
- 验证边界：本片只证明前端组件交互和可访问标签，不替代真实灰度审批、Hosted CI、staging 或 14 天观察。

## Document Upload Quality History Review

- 审计结论：第十一片覆盖 `DocumentUpload.vue` 质量知识成功路径，补上正式发布、灰度发布、回滚后的 UI history 追溯证据。
- 行为覆盖：正式发布成功会调用 `publishQualityKnowledgeRetrainingVersion`，并在上传记录展示 `AUD-QK-R3-PUBLISH`、`质量再训练发布` 和 `done`。
- 行为覆盖：灰度发布成功会调用 `grayPublishQualityKnowledgeNextTrainingSetVersion(..., 'initial')`，并展示 `AUD-QK-R3-GRAY-PUBLISH` 与 `质量再训练灰度发布`。
- 行为覆盖：回滚成功会调用 `rollbackQualityKnowledgeRetrainingVersion`，并展示 `AUD-QK-R3-ROLLBACK` 与回滚目标版本；上传记录表新增审计编号列，避免 auditId 写入后不可见。
- 覆盖率证据：`DocumentUpload.vue` 行覆盖率已到 `64.36%`；总行覆盖率已到 `70.50%`。
- 验证边界：本片只证明前端成功路径和审计编号可见性，不代表真实发布、真实灰度或 14 天观察已完成。

## Knowledge Governance Retraining Lifecycle Actions Review

- 审计结论：第十二片覆盖 `KnowledgeGovernancePanel.vue` 再训练候选生命周期按钮，补上审批、校验、补齐、发布、回滚的组件层交互证据。
- 行为覆盖：未生成训练版本时，`批准进入训练集：...` 按钮 emit `quality-retraining-approved` review queue id。
- 行为覆盖：已审批、校验失败、校验通过版本分别 emit `quality-retraining-validated`、`quality-retraining-validation-passed`、`quality-retraining-published` version id。
- 行为覆盖：可回滚状态 emit `quality-retraining-rolled-back` version id；已发布状态显示发布提示并保留审批、校验和发布审计说明。
- 覆盖率证据：`KnowledgeGovernancePanel.vue` 行覆盖率已到 `76.47%`；总行覆盖率已到 `70.74%`。
- 验证边界：本片只证明组件按钮可访问性和事件参数，不代表真实训练集发布、灰度或 release gate 已完成。

## Offline Preview Backend-first Guard + Knowledge E2E Smoke Review

- 审计结论：第十三片从单元覆盖转到真实浏览器 smoke 暴露的问题，修复 preview 缺后端时 backend-first 读取把 SPA HTML 当成证据 payload 的可靠性缺口。
- 行为覆盖：`readQualityKnowledgeEvidencePayloads()` 在后端返回 HTML、非数组或抛错时必须返回空数组，使训练版本读取回退本地缓存，不再触发 `includes` / `split` 读取 undefined 的运行时错误。
- 行为覆盖：`readOtdEvidenceChainRecordsBackendFirst()` 只接受有效 evidence 数组；非数组或无有效项时回退本地 OTD evidence，避免知识资产执行链空白。
- 行为覆盖：`Agent 治理` e2e selector 改为 `role=tab`，匹配当前 Admin UI 语义角色。
- 覆盖率证据：目标 unit `2 files / 26 tests passed`；全量前端 unit coverage `81 files / 354 tests passed`，总行覆盖率 `70.70%`。
- e2e 证据：上传文档 smoke 需普通模式依赖 route mock；再训练生命周期和 R6/R7 执行链 smoke 需 `AIMES_E2E_OFFLINE_DEMO=true`。
- 验证边界：本片仍是 A-track 前端可靠性与 smoke 证据；Hosted CI、staging、Attack Chain A/B/C、security signoff、首次灰度和 14 天观察仍未关闭。

## QualityBoard Inspection Filter Empty State Review

- 审计结论：第十四片覆盖 `QualityBoard.vue` 检验批次筛选空态，修复用户筛选无匹配结果时表格静默空白的 UX 正确性问题。
- 行为覆盖：当原始检验记录存在但当前结果筛选无匹配时，表格必须显示 `暂无匹配检验记录`，而不是只渲染空 `tbody`。
- 行为覆盖：当原始检验记录本身为空时，仍显示原有 `暂无检验记录`，不混淆“没数据”和“筛选无结果”。
- TDD 证据：新增测试先红于缺少 `.inspection-table .empty-state`，实现后目标 unit 变绿。
- 覆盖率证据：目标 unit `1 file / 2 tests passed`；全量前端 unit coverage `81 files / 355 tests passed`，总行覆盖率 `70.77%`，`QualityBoard.vue` 行覆盖率 `60.96%`。
- 验证边界：本片是 A-track 前端质量闭环操作体验；不替代真实 Hosted CI、staging 或人工 release gate。

## QualityBoard Cached Root Cause Reopen Review

- 审计结论：第十五片继续覆盖 `QualityBoard.vue` 根因分析用户路径，修复分析结果缓存后按钮被禁用、关闭面板后无法重开的交互缺陷。
- 行为覆盖：首次点击会调用 `analyzeRootCause()` 并打开 dialog；关闭后按钮必须保持可点击。
- 行为覆盖：再次点击同一检验批次时复用缓存分析结果，不重复请求 `analyzeRootCause()`。
- TDD 证据：新增测试先红于 `disabled=""` 仍存在；移除禁用后目标 unit 变绿。
- 覆盖率证据：目标 unit `1 file / 3 tests passed`；全量前端 unit coverage `81 files / 356 tests passed`，总行覆盖率 `70.78%`，`QualityBoard.vue` 行覆盖率 `61.40%`。
- 验证边界：本片只证明前端根因分析面板可重开和缓存复用；不关闭 B-track release gate。

## QualityBoard Root Cause Dialog Close A11y Review

- 审计结论：第十六片继续打磨 `QualityBoard.vue` 根因分析 dialog 可访问性，修复关闭按钮只有符号、缺少可读名称的问题。
- 行为覆盖：打开根因分析 dialog 后，`.close-btn` 必须带 `aria-label="关闭根因分析"`。
- TDD 证据：新增测试先红于 `aria-label` 为 `undefined`；添加属性后目标 unit 变绿。
- 覆盖率证据：目标 unit `1 file / 4 tests passed`；全量前端 unit coverage `81 files / 357 tests passed`，总行覆盖率 `70.78%`，`QualityBoard.vue` 行覆盖率 `61.40%`。
- 验证边界：本片只证明根因分析 dialog 关闭控件具备辅助技术名称；不关闭 B-track release gate。

## QualityBoard Root Cause Row Action A11y Review

- 审计结论：第十七片继续打磨 `QualityBoard.vue` 根因分析表格操作，修复多行同名“根因分析”按钮缺少目标记录名称的问题。
- 行为覆盖：每个根因分析行按钮必须带 `aria-label="查看 {inspectionId} 根因分析"`，让辅助技术用户知道点击目标。
- 行为保持：可见按钮文本仍为 `根因分析`，不改变布局和业务点击行为。
- TDD 证据：新增测试先红于行按钮 `aria-label` 为 `undefined`；添加动态属性后目标 unit 变绿。
- 覆盖率证据：目标 unit `1 file / 5 tests passed`；全量前端 unit coverage `81 files / 358 tests passed`，总行覆盖率 `70.78%`，`QualityBoard.vue` 行覆盖率 `61.40%`。
- 验证边界：本片只证明根因分析行级按钮目标名称明确；不关闭 B-track release gate。

## QualityBoard Inspection Filter A11y Review

- 审计结论：第十八片继续打磨 `QualityBoard.vue` 检验结果筛选控件，修复下拉框缺少辅助技术名称的问题。
- 行为覆盖：检验结果筛选下拉框必须带 `aria-label="筛选检验结果"`，让辅助技术用户知道该控件用于筛选检验批次结果。
- 行为保持：控件仍绑定原有 `statusFilter`，不改变筛选条件、选项文案或空态逻辑。
- TDD 证据：新增测试先红于筛选控件 `aria-label` 为 `undefined`；添加属性后目标 unit 变绿。
- 覆盖率证据：目标 unit `1 file / 6 tests passed`；全量前端 unit coverage `81 files / 359 tests passed`，总行覆盖率 `70.78%`，`QualityBoard.vue` 行覆盖率 `61.40%`。
- 验证边界：本片只证明质量检验筛选控件具备辅助技术名称；Hosted CI、staging、Attack Chain、安全签字、首次灰度和 14 天观察仍属 B-track。

## QualityBoard SPC Parameter Selector A11y Review

- 审计结论：第十九片继续打磨 `QualityBoard.vue` SPC 趋势分析参数选择控件，修复下拉框缺少辅助技术名称的问题。
- 行为覆盖：SPC 参数下拉框必须带 `aria-label="选择 SPC 参数"`，让辅助技术用户知道该控件用于切换趋势分析指标。
- 行为保持：控件仍绑定原有 `spcParam` 并在变更时调用 `loadSpc`，不改变 SPC 数据加载行为。
- TDD 证据：新增测试先红于 SPC 参数下拉框 `aria-label` 为 `undefined`；添加属性后目标 unit 变绿。
- 覆盖率证据：目标 unit `1 file / 7 tests passed`；全量前端 unit coverage `81 files / 360 tests passed`，总行覆盖率 `70.78%`，`QualityBoard.vue` 行覆盖率 `61.40%`。
- 验证边界：本片只证明 SPC 参数选择控件具备辅助技术名称；不关闭 B-track release gate。
