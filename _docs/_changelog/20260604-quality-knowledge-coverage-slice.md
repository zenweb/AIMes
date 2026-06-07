# 2026-06-04 Quality Knowledge Coverage Slice

## A-track Coverage Lever

- 选片依据：`npm run test:unit:coverage` 当前基线全绿，但 `LoginPage.vue` 已 100%；按覆盖率杠杆改选低覆盖且业务关键的 `quality-knowledge-sample-sync.ts`。
- 基线：前端 unit coverage `81 files / 335 tests passed`，总行覆盖率 `66.79%`；`src/utils/quality-knowledge-sample-sync.ts` 行覆盖率 `14.10%`。
- 修复：新增质量知识推荐版本选择测试，覆盖已回滚灰度版本不得继续 active、影子灰度版本必须经已批准扩大决策才可优先。
- 结果：前端 unit coverage `81 files / 337 tests passed`，总行覆盖率提升到 `67.29%`；目标文件行覆盖率提升到 `23.50%`。
- 验证：`npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Gray Decision Closure Slice

- 选片依据：继续同一业务关键文件，优先补灰度扩大、回滚复核问题单和 OTD 证据闭环，而不是转去刷低价值 API 包。
- 修复：新增灰度扩大 pending -> approved 测试，证明人工批准前证据保持 `ready`，批准后写入 `closed`；新增灰度回滚测试，证明回滚会打开复核问题单，负样本关闭与范围调整重开分别写入 `closed` / `ready` 证据状态。
- 结果：目标测试提升到 `1 file / 9 tests passed`；前端 unit coverage `81 files / 339 tests passed`。
- 覆盖率：总行覆盖率提升到 `68.33%`；`src/utils/quality-knowledge-sample-sync.ts` 行覆盖率提升到 `41.23%`。
- 验证：`npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Asset Governance Traceability Slice

- 选片依据：继续精品化质量知识治理链路，覆盖 `buildQualityKnowledgeAssetGovernanceRecords`，确保前端资产治理输出不是只有展示文本，而是保留可审计 `auditId` / `traceId`。
- 修复：新增资产治理综合测试，构造样本、已关闭低分复核、发布训练集、推荐采纳反馈、下一轮灰度训练集、回滚决策，断言所有治理资产都有非空 audit/trace。
- 行为覆盖：验证 `样本入库`、`禁用`、`负样本`、`再训练候选`、`推荐采纳`、`下一轮训练集`、`实验负样本`、`风险阈值` 均能输出对应来源证据。
- 结果：目标测试提升到 `1 file / 10 tests passed`；前端 unit coverage `81 files / 340 tests passed`。
- 覆盖率：总行覆盖率提升到 `69.32%`；`src/utils/quality-knowledge-sample-sync.ts` 行覆盖率提升到 `60.04%`。
- 验证：`npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Retraining Lifecycle Evidence Slice

- 选片依据：继续沿质量知识治理链路补训练集生命周期函数，确保验证失败、验证通过、发布、回滚都不是仅更新本地状态，而是同步写入 OTD evidence。
- 修复：新增训练集生命周期测试，从 approved 版本出发，依次运行 `runQualityKnowledgeRetrainingValidation`、`rerunQualityKnowledgeRetrainingValidationPass`、`publishQualityKnowledgeRetrainingVersion`、`rollbackQualityKnowledgeRetrainingVersion`。
- 行为覆盖：校验失败写 `知识再训练校验 / active`，校验通过写 `知识再训练校验通过 / ready`，发布后审批和校验证据转 `closed` 并新增 `知识再训练发布`，回滚后审批和校验失败证据转 `closed` 并新增 `知识再训练回滚`。
- 结果：目标测试提升到 `1 file / 11 tests passed`；前端 unit coverage `81 files / 341 tests passed`。
- 覆盖率：总行覆盖率提升到 `69.62%`；`src/utils/quality-knowledge-sample-sync.ts` 行覆盖率提升到 `65.59%`。
- 验证：`npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Reopened Gray Republish Slice

- 选片依据：继续覆盖质量知识治理链路中重新灰度发布分支，避免旧回滚决策把已重开校验并重新灰度发布的版本错误排除。
- 修复：新增 reopened 灰度发布测试，构造 R3 初次灰度、范围调整重开校验、reopened 校验通过、reopened 灰度发布，再验证 active/prioritized 推荐选择器仍选中重新灰度发布的 R3。
- 行为覆盖：`grayPublishQualityKnowledgeNextTrainingSetVersion(..., 'reopened')` 必须写入 `AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001` 和 `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED`，并生成 `知识再训练灰度发布 / closed` OTD evidence。
- 结果：目标测试提升到 `1 file / 12 tests passed`；前端 unit coverage `81 files / 342 tests passed`。
- 覆盖率：总行覆盖率提升到 `69.74%`；`src/utils/quality-knowledge-sample-sync.ts` 行覆盖率提升到 `67.94%`。
- 验证：`npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Backend-first Evidence Read Slice

- 选片依据：补质量知识治理链路的 backend-first 读取分支，确保后端证据源可覆盖本地缓存，同时坏 payload 不污染前端状态。
- 修复：新增后端有效 `QualityKnowledgeSample` payload 优先测试，证明 `readQualityKnowledgeSamplesBackendFirst()` 返回后端样本且不覆盖本地缓存。
- 修复：新增后端无效 `QualityKnowledgeRetrainingVersion` payload 回退测试，证明坏 payload 被过滤后 `readQualityKnowledgeRetrainingVersionRecordsBackendFirst()` 回退本地训练版本。
- 结果：目标测试提升到 `1 file / 14 tests passed`；前端 unit coverage `81 files / 344 tests passed`。
- 覆盖率：总行覆盖率提升到 `69.76%`；`src/utils/quality-knowledge-sample-sync.ts` 行覆盖率提升到 `68.37%`。
- 验证：`npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Experiment Candidate Evidence Slice

- 选片依据：继续质量知识治理精品链路，覆盖多个页面共同使用的推荐实验候选输出，避免负样本补丁和影子验证候选只有展示实现、缺少测试证据。
- 修复：新增实验候选综合测试，构造 R5 灰度回滚、R6 负样本补丁、R7 影子验证/影子灰度发布，断言 candidate type、audit/trace、nextAction、references 和负样本覆盖率。
- 行为覆盖：R6 未合并时保持 `guarded` 且提示补 1 条跨线负样本；合并后使用 merge audit/trace；R7 影子发布后使用 publish audit/trace 且仍要求等待质量主管确认。
- 结果：目标测试提升到 `1 file / 15 tests passed`；前端 unit coverage `81 files / 345 tests passed`。
- 覆盖率：总行覆盖率提升到 `69.85%`；`src/utils/quality-knowledge-sample-sync.ts` 行覆盖率提升到 `70.08%`。
- 验证：`npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Bad Payload Defaults Slice

- 选片依据：继续补质量知识治理链路的坏数据防护，覆盖 reuse closure、recommendation feedback 和灰度决策 legacy defaults，避免不完整治理 payload 留在本地缓存。
- 修复：新增坏 closure/feedback 清洗测试，空 `feedbackActions` / `feedbackMetrics` 记录会被过滤并回写缓存，只保留可审计的有效记录。
- 修复：新增灰度决策 defaults 持久化测试，legacy 决策缺少 release cycle/audit/trace/scope 时会补默认字段并写回 localStorage。
- 修复：新增坏后端 recommendation feedback fallback 测试，后端 payload 结构不完整时回退本地有效反馈。
- 结果：目标测试提升到 `1 file / 17 tests passed`；前端 unit coverage `81 files / 347 tests passed`。
- 覆盖率：总行覆盖率提升到 `70.04%`；`src/utils/quality-knowledge-sample-sync.ts` 行覆盖率提升到 `73.62%`。
- 验证：`npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Backend-first Governance Payload Slice

- 选片依据：继续覆盖质量知识 backend-first 读取链路中剩余治理 payload，确保 reuse draft、reuse closure、review queue、gray decision 的后端证据优先级和坏数据回退都有单测。
- 修复：新增有效后端 payload 优先测试，验证 reuse draft、reuse closure、review queue 读取后端记录，且不覆盖本地缓存。
- 修复：新增灰度决策 backend-first defaults 测试，后端 legacy gray decision payload 会补齐 release cycle/audit/trace/scope。
- 修复：新增坏后端 review queue fallback 测试，后端 review payload 不完整时回退本地有效复核记录。
- 结果：目标测试提升到 `1 file / 19 tests passed`；前端 unit coverage `81 files / 349 tests passed`。
- 覆盖率：总行覆盖率提升到 `70.17%`；`src/utils/quality-knowledge-sample-sync.ts` 行覆盖率提升到 `76.79%`。
- 验证：`npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Knowledge Governance Experiment Actions Slice

- 选片依据：从工具函数转向用户必经组件交互，覆盖质量知识治理面板里的实验候选按钮，确保 R6/R7/R9 动作可读、可触发、可追踪。
- 修复：新增 `KnowledgeGovernancePanel` 实验候选交互测试，验证负样本合并、影子验证、影子灰度发布按钮带 asset title 的 `aria-label`，并 emit 正确 candidate/version id。
- 修复：实验候选按钮和状态说明改为按候选版本动态显示，避免 R9 影子候选仍显示固定 R7 文案。
- 结果：目标测试 `1 file / 3 tests passed`；前端 unit coverage `81 files / 350 tests passed`。
- 覆盖率：总行覆盖率提升到 `70.43%`；`src/components/knowledge/KnowledgeGovernancePanel.vue` 行覆盖率提升到 `55.88%`。
- 验证：`npm run test:unit -- tests/unit/knowledge-governance-panel.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Document Upload Quality History Slice

- 选片依据：继续组件层关键交互，覆盖 `DocumentUpload.vue` 中质量知识正式发布、灰度发布、回滚成功后的 history 证据，避免只测 fail-loud 分支。
- 修复：新增成功路径测试，触发 `quality-retraining-published`、`quality-next-training-gray-published`、`quality-retraining-rolled-back`，验证调用对应写入函数并在上传记录展示类别、状态和审计编号。
- 修复：上传记录表新增“审计编号”列，展示 history 中的 `documentId`，让质量发布/灰度/回滚记录可从 UI 直接追溯 auditId。
- 结果：目标测试 `1 file / 12 tests passed`；前端 unit coverage `81 files / 351 tests passed`。
- 覆盖率：总行覆盖率提升到 `70.50%`；`src/components/knowledge/DocumentUpload.vue` 行覆盖率提升到 `64.36%`。
- 验证：`npm run test:unit -- tests/unit/document-upload.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Knowledge Governance Retraining Lifecycle Actions Slice

- 选片依据：继续质量知识治理面板组件层关键交互，覆盖再训练候选从审批、校验、补齐重校、发布、回滚到已发布提示的用户必经按钮。
- 修复：新增 `KnowledgeGovernancePanel` 训练集生命周期测试，验证五个按钮都带 asset title 的 `aria-label`，并 emit 正确 review/version id。
- 修复：再训练生命周期按钮补充可读 `aria-label`，让审批、发布前校验、补齐字段、发布、回滚动作都能被辅助技术准确识别。
- 结果：目标测试 `1 file / 4 tests passed`；前端 unit coverage `81 files / 352 tests passed`。
- 覆盖率：总行覆盖率提升到 `70.74%`；`src/components/knowledge/KnowledgeGovernancePanel.vue` 行覆盖率提升到 `76.47%`。
- 验证：`npm run test:unit -- tests/unit/knowledge-governance-panel.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## Offline Preview Backend-first Guard + Knowledge E2E Smoke

- 选片依据：真实浏览器 smoke 暴露 Nuxt preview 缺后端时 `/api/v1/...` 会返回 SPA HTML，属于用户必经知识治理链路的可靠性问题，优先于继续精修已高覆盖登录页。
- 修复：`readQualityKnowledgeEvidencePayloads()` 增加 try/catch 和数组类型门禁，后端/preview 返回 HTML 或非数组时返回 `[]`，让 backend-first 读取回退本地缓存。
- 修复：`readOtdEvidenceChainRecordsBackendFirst()` 只接受数组并过滤 `isEvidenceItem`，非数组或无有效 evidence 时回退本地 OTD evidence。
- 修复：`Knowledge` e2e 中 `Agent 治理` 选择器从 `button` 更新为当前 Admin UI 的 `tab`，避免 smoke 被过期角色阻断。
- 结果：新增 offline preview 回退测试后，目标 unit `2 files / 26 tests passed`；前端 unit coverage `81 files / 354 tests passed`。
- 覆盖率：总行覆盖率校准为 `70.70%`；`quality-knowledge-sample-sync.ts` 行覆盖率 `76.72%`；`otd-evidence-chain-sync.ts` 行覆盖率 `90.47%`。
- 验证：`npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts tests/unit/otd-evidence-chain-sync.test.ts` 通过；`npm run test:e2e -- tests/e2e/knowledge.spec.ts -g "上传文档进入待索引治理队列"` 普通模式通过；`AIMES_E2E_OFFLINE_DEMO=true npm run test:e2e -- tests/e2e/knowledge.spec.ts -g "批准再训练候选生成训练集版本并支持回滚|R5 回滚后的 R6 补样和 R7 影子验证进入知识资产执行链"` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## QualityBoard Inspection Filter Empty State Slice

- 选片依据：从质量知识工具函数转向用户必经的 `QualityBoard.vue`；该组件行覆盖率约 `59.73%`，且检验结果筛选是现场质量闭环的基础操作。
- 修复：筛选后无匹配检验批次时，表格不再空白；`filteredInspections` 为空时显示空态。
- 修复：新增 `inspectionEmptyMessage`，区分“没有任何检验记录”和“当前筛选条件无匹配记录”，避免用户误判数据丢失。
- 测试：新增 `quality-board.test.ts` 用例，先验证筛选“合格”但仅有“不合格”数据时缺少空态的红灯，再实现最小修复。
- 结果：目标 unit `1 file / 2 tests passed`；前端 unit coverage `81 files / 355 tests passed`。
- 覆盖率：总行覆盖率提升到 `70.77%`；`src/components/quality/QualityBoard.vue` 行覆盖率提升到 `60.96%`。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## QualityBoard Cached Root Cause Reopen Slice

- 选片依据：继续打磨 `QualityBoard.vue` 同一现有质量闭环功能；根因分析是质量检验用户必经动作，不能在缓存后变成一次性按钮。
- 修复：移除根因分析按钮在 `analysisMap[ins.id]` 存在时的禁用状态，让用户关闭面板后仍可重新打开已缓存分析结果。
- 行为保持：复用现有 `showAnalysis()` 缓存分支，重新打开时不重复调用 `analyzeRootCause()`。
- 测试：新增 TDD 用例，先验证关闭后按钮仍被 disabled 的红灯，再实现最小修复。
- 结果：目标 unit `1 file / 3 tests passed`；前端 unit coverage `81 files / 356 tests passed`。
- 覆盖率：总行覆盖率提升到 `70.78%`；`src/components/quality/QualityBoard.vue` 行覆盖率提升到 `61.40%`。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## QualityBoard Root Cause Dialog Close A11y Slice

- 选片依据：继续同一 `QualityBoard.vue` 根因分析用户路径，补齐 dialog 关闭控件的辅助技术名称，避免屏幕阅读器只读到 `✕`。
- 修复：根因分析面板关闭按钮新增 `aria-label="关闭根因分析"`。
- 测试：新增 TDD 用例，先验证 `.close-btn` 缺少 `aria-label` 的红灯，再实现最小修复。
- 结果：目标 unit `1 file / 4 tests passed`；前端 unit coverage `81 files / 357 tests passed`。
- 覆盖率：总行覆盖率保持 `70.78%`；`src/components/quality/QualityBoard.vue` 行覆盖率保持 `61.40%`。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## QualityBoard Root Cause Row Action A11y Slice

- 选片依据：继续同一 `QualityBoard.vue` 根因分析用户路径；检验表格每行都有“根因分析”按钮，同名按钮会让辅助技术用户无法区分目标检验记录。
- 修复：根因分析行按钮新增动态 `aria-label`，格式为 `查看 {inspectionId} 根因分析`。
- 行为保持：按钮可见文案仍为 `根因分析`，点击仍调用 `showAnalysis(ins.id)`。
- 测试：新增 TDD 用例，先验证 `.action-btn` 缺少行级 `aria-label` 的红灯，再实现最小修复。
- 结果：目标 unit `1 file / 5 tests passed`；前端 unit coverage `81 files / 358 tests passed`。
- 覆盖率：总行覆盖率保持 `70.78%`；`src/components/quality/QualityBoard.vue` 行覆盖率保持 `61.40%`。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## QualityBoard Inspection Filter A11y Slice

- 选片依据：继续 `QualityBoard.vue` 用户必经质量闭环；检验结果筛选控件缺少辅助技术名称，会让屏幕阅读器用户只听到原生下拉框而不知道筛选目的。
- 修复：`.filter-select` 新增 `aria-label="筛选检验结果"`。
- 行为保持：筛选选项、默认值和 `v-model` 逻辑不变，只补可访问名称。
- 测试：新增 TDD 用例，先验证筛选控件缺少 `aria-label` 的红灯，再实现最小修复。
- 结果：目标 unit `1 file / 6 tests passed`；前端 unit coverage `81 files / 359 tests passed`。
- 覆盖率：总行覆盖率保持 `70.78%`；`src/components/quality/QualityBoard.vue` 行覆盖率保持 `61.40%`。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。

## QualityBoard SPC Parameter Selector A11y Slice

- 选片依据：继续 `QualityBoard.vue` 质量闭环；SPC 趋势分析参数下拉是质量监控用户必经控件，缺少辅助技术名称会让控件目的不清。
- 修复：`.param-select` 新增 `aria-label="选择 SPC 参数"`。
- 行为保持：SPC 参数选项、`spcParam` 绑定和 `loadSpc` 触发逻辑不变，只补可访问名称。
- 测试：新增 TDD 用例，先验证 `.param-select` 缺少 `aria-label` 的红灯，再实现最小修复。
- 结果：目标 unit `1 file / 7 tests passed`；前端 unit coverage `81 files / 360 tests passed`。
- 覆盖率：总行覆盖率保持 `70.78%`；`src/components/quality/QualityBoard.vue` 行覆盖率保持 `61.40%`。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过；`npm run test:unit:coverage` 通过；`npm run lint` 通过。
