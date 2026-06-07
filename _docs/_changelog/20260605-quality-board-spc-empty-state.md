# 2026-06-05 QualityBoard SPC Empty State

## QualityBoard SPC Empty State Slice

- 选片依据：继续按覆盖率杠杆和用户必经路径推进 A-track；`QualityBoard.vue` 是质量闭环核心看板，SPC 趋势分析是现场质量监控入口。
- 问题：后端正常返回但 `dataPoints` 为空时，SPC 图表区域只有控制线和空 polyline，用户无法区分“暂无数据”和“图表故障”。
- 修复：SPC 图表容器在 `spcData.length === 0` 时显示 `暂无 SPC 数据` 空态。
- 行为保持：不伪造 SPC 数据；有数据时仍按 `analyzeSpcTrend()` 返回值渲染点位、趋势告警和建议。
- 测试：新增 TDD 用例 `explains when SPC analysis returns no data points`，先红于缺少 `.spc-empty-state`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 361 tests passed`，总行覆盖率 `70.78%`，`QualityBoard.vue` 行覆盖率 `61.40%`。
- 验证：`npm run lint` 通过。

## QualityBoard Root Cause In-flight Dedupe Slice

- 选片依据：继续同一 `QualityBoard.vue` 质量闭环；根因分析是现场质量用户的高成本 AI 分析动作，快速重复点击不应重复消耗后端分析资源。
- 问题：现有缓存只在请求完成后生效；同一检验批次第一次请求未返回前，重复点击会多次调用 `analyzeRootCause()`。
- 修复：新增同一检验 ID 的 in-flight Promise 复用；请求完成后写入 `analysisMap` 并清理 pending 记录。
- 行为保持：已缓存结果仍直接重开；API 失败时仍使用原 demo fallback；不改变 dialog 展示结构。
- 测试：新增 TDD 用例 `reuses an in-flight root cause analysis request for repeated clicks on the same inspection`，先红于重复调用 2 次，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 9 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 362 tests passed`，总行覆盖率 `70.81%`，`QualityBoard.vue` 行覆盖率 `62.82%`。
- 验证：`npm run lint` 通过。

## QualityBoard Root Cause Latest Selection Race Slice

- 选片依据：继续打磨 `QualityBoard.vue` 根因分析路径；用户可能连续查看不同检验批次，旧请求不应覆盖最新选择。
- 问题：同一批次 in-flight 复用后，跨批次慢请求仍可能在后完成时写回 `currentAnalysis`，把用户后点击的检验记录面板覆盖掉。
- 修复：新增 `latestAnalysisInspectionId` 门禁；只有最后一次点击对应的检验 ID 才能更新当前 dialog。
- 行为保持：所有请求结果仍会写入 `analysisMap`，便于后续重开缓存；只是阻止旧请求抢占当前面板。
- 测试：新增 TDD 用例 `keeps the latest root cause analysis visible when an earlier request finishes later`，先红于慢请求覆盖快请求，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 10 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 363 tests passed`，总行覆盖率 `70.83%`，`QualityBoard.vue` 行覆盖率 `63.44%`。
- 验证：`npm run lint` 通过。

## QualityBoard SPC Latest Parameter Race Slice

- 选片依据：继续同一质量看板可靠性路径；SPC 参数下拉是质量监控入口，快速切换参数时旧请求不应覆盖新参数结果。
- 问题：`loadSpc()` 使用当前 `spcParam` 发起请求，但请求返回后不校验参数是否仍是当前选择；旧慢请求后完成会覆盖新参数图表、告警和建议。
- 修复：在 `loadSpc()` 捕获 `requestedParam`，成功和 fallback 写入前都校验当前 `spcParam` 仍等于请求参数。
- 行为保持：当前参数请求仍正常渲染；旧请求被忽略，不伪造数据、不取消现有 API。
- 测试：新增 TDD 用例 `keeps the latest SPC parameter result when an earlier request finishes later`，先红于粗糙度旧请求覆盖硬度结果，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 11 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 364 tests passed`，总行覆盖率 `70.86%`，`QualityBoard.vue` 行覆盖率 `64.58%`。
- 验证：`npm run lint` 通过。

## QualityBoard Root Cause Stale Dialog Clear Slice

- 选片依据：继续 `QualityBoard.vue` 根因分析路径精品化；用户切换检验批次时，等待新分析期间不应继续看到旧批次结果。
- 问题：点击未缓存的新检验批次后，旧 `currentAnalysis` 会一直留在 dialog 中直到新请求返回，容易误导质量工程师把旧分析当成新批次结果。
- 修复：`showAnalysis()` 在未命中缓存、准备发起新分析请求前先清空 `currentAnalysis`。
- 行为保持：缓存命中仍立即显示；新请求返回后仍按最新点击门禁更新 dialog。
- 测试：新增 TDD 用例 `clears the previous root cause dialog while loading a different inspection analysis`，先红于旧 dialog 残留，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 12 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 365 tests passed`，总行覆盖率 `70.86%`，`QualityBoard.vue` 行覆盖率 `64.73%`。
- 验证：`npm run lint` 通过。

## ProductionBoard Stale Selection Filter Slice

- 选片依据：按覆盖率杠杆转向 `ProductionBoard.vue`；生产报工是操作员用户必经路径，当前行覆盖率约 `60.45%`，边际收益高于继续精修已 100% 的登录页。
- 问题：选中一个工单后切换状态筛选，如果新列表不再包含该工单，右侧详情仍显示旧工单，造成列表筛选和可操作详情不一致。
- 修复：`loadWorkOrders()` 成功刷新列表后同步当前选中工单；若新结果仍包含该 ID，则更新为刷新后的对象；若不包含，则清空右侧详情和当前工序。
- 行为保持：列表中仍存在的选中工单不会被误清空；分页/筛选仍使用原 `getWorkOrders()` 参数。
- 测试：新增 TDD 用例 `clears stale work-order detail when the status filter removes the selected order`，先红于旧详情残留，再最小修复。
- 验证：`npm run test:unit -- tests/unit/production-board.test.ts` 通过，`1 file / 12 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 366 tests passed`，总行覆盖率 `70.91%`，`ProductionBoard.vue` 行覆盖率 `60.45%`。
- 验证：`npm run lint` 通过。
- B-track 核验：`gh auth status -h github.com` 已登录 `zenweb` 且 scope 含 `repo/workflow`；但 `origin` 仍是腾讯工蜂，`gh repo view zenweb/AIMes` 仍无法解析 GitHub 仓库，Hosted CI 仍缺真实 repo/Actions run 证据。

## ProductionBoard Latest Filter Request Race Slice

- 选片依据：继续 `ProductionBoard.vue` 生产报工筛选路径；状态筛选是操作员定位工单的高频入口，竞态会直接污染列表结果。
- 问题：快速切换状态筛选时，旧慢请求晚返回会覆盖新快请求结果；例如先切 `pending` 再切 `completed`，`pending` 响应晚到会让当前 `completed` 筛选下列表变空。
- 修复：为 `loadWorkOrders()` 增加递增 request id 门禁；只有最新请求允许写入 `workOrders/totalCount` 或触发 demo fallback 通知。
- 行为保持：正常单次加载、分页、状态筛选参数不变；只忽略过期响应，不取消请求、不新增接口契约。
- 测试：新增 TDD 用例 `keeps the latest status filter result when an earlier request finishes later`，先红于旧请求覆盖最新结果，再最小修复。
- 验证：`npm run test:unit -- tests/unit/production-board.test.ts` 通过，`1 file / 13 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 367 tests passed`，总行覆盖率 `70.92%`，`ProductionBoard.vue` 行覆盖率 `60.75%`。
- 验证：`npm run lint` 通过。

## ProductionBoard Latest Scan Request Race Slice

- 选片依据：继续 `ProductionBoard.vue` 生产报工路径；扫码定位工单/工序是操作员进入开工、完工、异常上报的核心入口。
- 问题：快速连续扫码时，第一次扫码的慢响应可能晚于第二次扫码返回，并覆盖最新扫码定位的工单详情和工序。
- 修复：为 `handleScan()` 增加递增 scan request id；旧扫码成功或失败响应不再写入 `selectedWo/currentOperations/scanCode/notification` 或继续本地 fallback。
- 行为保持：单次扫码、扫码 API 失败后的本地搜索、未找到提示仍沿用原行为；只忽略过期扫码响应。
- 测试：新增 TDD 用例 `keeps the latest scanned operation when an earlier scan finishes later`，先红于 `WO-SLOW` 覆盖 `WO-FAST`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/production-board.test.ts` 通过，`1 file / 14 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 368 tests passed`，总行覆盖率 `70.93%`，`ProductionBoard.vue` 行覆盖率 `61.04%`。
- 验证：`npm run lint` 通过。

## ProductionBoard Latest Work-order Selection Race Slice

- 选片依据：继续 `ProductionBoard.vue` 生产报工路径；点选工单加载工序是扫码之外的另一条高频入口。
- 问题：快速点选两个工单时，前一个工单的慢工序响应会覆盖后一个工单的当前工序，导致右侧标题和工序列表不一致。
- 修复：为 `selectWorkOrder()` 增加递增 selection request id；旧点选成功或 fallback 响应不再写入 `currentOperations`。
- 行为保持：最新点选仍立即更新右侧工单详情；最新点选失败仍沿用 demo 工序 fallback；只忽略过期点选响应。
- 测试：新增 TDD 用例 `keeps the latest selected work order operations when an earlier selection finishes later`，先红于 `OP-SELECT-SLOW` 覆盖 `OP-SELECT-FAST`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/production-board.test.ts` 通过，`1 file / 15 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 369 tests passed`，总行覆盖率 `70.96%`，`ProductionBoard.vue` 行覆盖率 `61.52%`。
- 验证：`npm run lint` 通过。

## ProductionBoard Selection Loading Stale Operations Slice

- 选片依据：继续 `ProductionBoard.vue` 点选工单路径；等待新工序加载时不应展示上一工单的可操作工序。
- 问题：点选第二个工单后，新工序响应返回前，右侧标题已切换到新工单，但工序列表仍显示上一工单工序。
- 修复：`selectWorkOrder()` 在更新 `selectedWo` 后立即清空 `currentOperations`，等待 API 或 demo fallback 回填最新工序。
- 行为保持：最新响应返回后仍正常显示工序；旧响应门禁仍继续防止过期写入。
- 测试：新增 TDD 用例 `clears previous operations while loading a newly selected work order`，先红于旧 `OP-LOADED` 残留，再最小修复。
- 验证：`npm run test:unit -- tests/unit/production-board.test.ts` 通过，`1 file / 16 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 370 tests passed`，总行覆盖率 `70.96%`，`ProductionBoard.vue` 行覆盖率 `61.59%`。
- 验证：`npm run lint` 通过。

## ProductionBoard Manual Selection To Scan Race Slice

- 选片依据：继续 `ProductionBoard.vue` 生产报工入口一致性；点选和扫码都会定位工序，跨入口竞态会让用户看到错误工序。
- 问题：先点选慢响应工单，再扫码快响应工单时，旧点选工序响应会在扫码成功后覆盖扫码工序。
- 修复：`handleScan()` 开始扫码时递增 `latestWorkOrderSelectionRequestId`，让所有旧点选工序响应过期。
- 行为保持：扫码自身最新请求门禁不变；点选自身门禁不变；只补齐点选到扫码的跨入口失效关系。
- 测试：新增 TDD 用例 `keeps scanned operation when an earlier manual selection finishes later`，先红于 `OP-MANUAL-SLOW` 覆盖 `OP-SCAN-FAST`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/production-board.test.ts` 通过，`1 file / 17 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 371 tests passed`，总行覆盖率 `70.96%`，`ProductionBoard.vue` 行覆盖率 `61.66%`。
- 验证：`npm run lint` 通过。

## ReportBoard Optional Evidence Resilience Slice

- 选片依据：按覆盖率杠杆转向 `ReportBoard.vue`；报表中心是经营复盘和 POC 证据导出的用户关键路径，当前行覆盖率约 `61.89%`，仍有真实可靠性缺口。
- 问题：`onMounted()` 中可选证据读取使用裸 `await` 串行执行；任一辅助证据源失败会抛出 mounted hook 未处理异常，并阻断后续 `getReportDashboard()` 主报表加载。
- 修复：新增 `readOptionalReportEvidence()`，辅助证据读取失败时返回 fallback，并通过 `reportActionError` fail loud；主 dashboard 加载继续执行。
- 行为保持：主报表 API 失败仍沿用原 demo fallback；辅助证据成功时原展示逻辑不变。
- 测试：新增 TDD 用例 `keeps loading the dashboard when optional POC evidence is unavailable`，先红于 mounted hook 未处理异常且 `getReportDashboard()` 未调用，再最小修复。
- 验证：`npm run test:unit -- tests/unit/report-board.test.ts` 通过，`1 file / 3 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 372 tests passed`，总行覆盖率 `70.98%`，`ReportBoard.vue` 行覆盖率 `62.17%`。
- 验证：`npm run lint` 通过。

## ReportBoard Schedule Feedback Local Fallback Slice

- 选片依据：继续 `ReportBoard.vue` 报表复盘路径；排产采纳反馈是 OTD 证据链中的人工复核证据，后端短暂不可用时不应丢失本地已归档快照。
- 问题：`getLatestAdoptionFeedback()` 失败时，外层 optional helper 直接返回 `null`，不会再读取 `readScheduleFeedbackSnapshot()`，导致 OTD 复盘证据链缺少“人工采纳”记录。
- 修复：新增 `readScheduleFeedbackReportEvidence()`；后端成功时沿用后端结果或本地快照，后端失败时 fail loud 并回退读取本地快照。
- 行为保持：后端返回记录时仍优先展示后端记录；无后端记录且本地无快照时仍为 `null`；错误提示仍通过 `reportActionError` 暴露。
- 测试：新增 TDD 用例 `uses the local schedule feedback snapshot when backend feedback is unavailable`，先红于本地快照未被调用，再最小修复。
- 验证：`npm run test:unit -- tests/unit/report-board.test.ts` 通过，`1 file / 4 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 373 tests passed`，总行覆盖率 `71%`，`ReportBoard.vue` 行覆盖率 `62.63%`。
- 验证：`npm run lint` 通过。
- B-track 核验：`gh auth status` 显示已登录 `zenweb`，scope 含 `repo/workflow`；`gh repo view zenweb/AIMes` 仍未解析到仓库，Hosted CI 仍缺真实 GitHub repo/Actions run。

## ReportBoard POC Rollout Fail-loud Slice

- 选片依据：继续 `ReportBoard.vue` POC 转上线路径；POC 签署后的上线交付行动包是从演示验收到真实试点的关键证据，不应静默失败。
- 问题：点击“生成上线交付行动包”时，如果 `writePocRolloutPackageRecord()` 返回 `null`，页面不会展示错误，也不会解释为什么交付包没有生成。
- 修复：`handleGeneratePocRolloutPackage()` 增加 `null` 和异常处理；写入失败时通过 `reportActionError` 明确提示，成功时才更新 `pocRolloutPackage` 并清理旧错误。
- 行为保持：POC 签署记录存在后仍可生成交付包；生成成功后仍刷新 OTD 证据链；未签署时仍不执行。
- 测试：新增 TDD 用例 `keeps the POC rollout package ungenerated when rollout evidence cannot be archived`，先红于缺少 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/report-board.test.ts` 通过，`1 file / 5 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 374 tests passed`，总行覆盖率 `71.02%`，`ReportBoard.vue` 行覆盖率 `63.11%`。
- 验证：`npm run lint` 通过。

## ReportBoard POC Pilot Run Fail-loud Slice

- 选片依据：继续 `ReportBoard.vue` POC 转上线后的真实工单试点路径；试点运行闭环是从上线交付包进入真实工单验证的关键证据。
- 问题：点击“确认试点运行闭环”时，如果 `writePocPilotRunRecord()` 返回 `null`，页面不会展示错误，也不会说明试点运行记录未归档。
- 修复：`handleConfirmPocPilotRun()` 增加 `null` 和异常处理；写入失败时通过 `reportActionError` 明确提示，成功时才更新 `pocPilotRun` 并刷新 OTD 证据链。
- 行为保持：已有上线交付包后仍可确认试点运行；成功写入后仍展示首批真实工单运行结果；无交付包时仍不执行。
- 测试：新增 TDD 用例 `keeps the POC pilot run unconfirmed when pilot evidence cannot be archived`，先红于缺少 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/report-board.test.ts` 通过，`1 file / 6 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 375 tests passed`，总行覆盖率 `71.06%`，`ReportBoard.vue` 行覆盖率 `63.75%`。
- 验证：`npm run lint` 通过。

## ReportBoard POC Hypercare Fail-loud Slice

- 选片依据：继续 `ReportBoard.vue` POC 正式上线验收路径；Hypercare 监控包承接真实工单试点后的 7 天稳定运行证据。
- 问题：点击“生成上线验收与 Hypercare 监控包”时，如果 `writePocHypercareAcceptanceRecord()` 返回 `null`，页面不会展示错误，也不会说明 Hypercare 验收记录未归档。
- 修复：`handleGeneratePocHypercareAcceptance()` 增加 `null` 和异常处理；写入失败时通过 `reportActionError` 明确提示，成功时才更新 `pocHypercareAcceptance` 并刷新 OTD 证据链。
- 行为保持：已有试点运行记录后仍可生成 Hypercare 包；成功写入后仍展示稳定运行监控；无试点运行时仍不执行。
- 测试：新增 TDD 用例 `keeps the POC hypercare package ungenerated when hypercare evidence cannot be archived`，先红于缺少 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/report-board.test.ts` 通过，`1 file / 7 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 376 tests passed`，总行覆盖率 `71.1%`，`ReportBoard.vue` 行覆盖率 `64.55%`。
- 验证：`npm run lint` 通过。

## ReportBoard OTD KPI Commitment Fail-loud Slice

- 选片依据：继续 `ReportBoard.vue` 经营复盘路径；OTD KPI 承诺包是从 KPI 钻取解释转为客户可复盘承诺的关键动作。
- 问题：点击“生成客户交付恢复承诺包”时，如果 `writeOtdKpiCommitmentPackage()` 抛错，Vue 会出现未处理事件错误，页面没有 fail loud 提示。
- 修复：`handleGenerateOtdKpiCommitment()` 增加统一 `try/catch`；客户承诺包和外协承诺包成功时才更新状态并清理旧错误，失败时通过 `reportActionError` 明确提示。
- 行为保持：默认客户 KPI 承诺包、`product-flange` 外协承诺包仍沿用原输入和证据链刷新；只补齐失败提示和未处理异常。
- 测试：新增 TDD 用例 `keeps the OTD KPI commitment package ungenerated when commitment evidence cannot be archived`，先红于未处理异常和缺少 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/report-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 377 tests passed`，总行覆盖率 `71.18%`，`ReportBoard.vue` 行覆盖率 `65.84%`。
- 验证：`npm run lint` 通过。

## ReportBoard CSV Export Fail-loud Slice

- 选片依据：继续 `ReportBoard.vue` 报表交付路径；CSV 导出是经营复盘、POC 证据包和客户沟通中的高频交付动作。
- 问题：点击 CSV 导出时，如果 `downloadCsv()` 抛错，Vue 会出现未处理事件错误，页面没有 alert 告知用户证据导出未完成。
- 修复：`handleExportCsv()` 增加 `try/catch`；导出成功时清理旧 `reportActionError`，导出失败时通过 `reportActionError` 显示“报表 CSV 导出失败”及具体错误。
- 行为保持：CSV headers、rows 构建逻辑和文件名逻辑不变；只补齐失败提示和未处理异常。
- 测试：新增 TDD 用例 `reports when CSV export cannot be downloaded`，先红于找不到 `[role="alert"]` 且存在未处理事件异常，再最小修复。
- 验证：`npm run test:unit -- tests/unit/report-board.test.ts` 通过，`1 file / 9 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 378 tests passed`，总行覆盖率 `71.78%`，`ReportBoard.vue` 行覆盖率 `75.08%`。
- 验证：`npm run lint` 通过。

## ReportBoard Excel/PDF Export Fail-loud Slice

- 选片依据：继续 `ReportBoard.vue` 报表交付导出链路；CSV 已 fail loud 后，Excel/PDF 仍是同一用户必经交付动作，不能留下静默失败口。
- 问题：点击 Excel 或 PDF 导出时，如果浏览器 anchor click 抛错，Vue 会出现未处理事件错误，页面没有 alert 告知用户报表文件未打开。
- 修复：新增 `handleReportFileExport()` 包装 Excel/PDF 下载动作；成功时清理旧 `reportActionError`，失败时分别提示“报表 Excel 导出失败”或“报表 PDF 导出失败”。
- 行为保持：Excel/PDF 的 URL 和文件名不变；只补齐失败提示和未处理异常。
- 测试：新增 TDD 用例 `reports when Excel export cannot be opened` 与 `reports when PDF export cannot be opened`，先红于缺少 alert 和未处理事件异常，再最小修复。
- 验证：`npm run test:unit -- tests/unit/report-board.test.ts` 通过，`1 file / 11 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 380 tests passed`，总行覆盖率 `71.87%`，`ReportBoard.vue` 行覆盖率 `76.52%`。
- 验证：`npm run lint` 通过。

## BarcodePrintBoard Keyboard And Print Fail-loud Slice

- 选片依据：按覆盖率杠杆转向 `BarcodePrintBoard.vue`；条码/QR 打印是现场贴标、扫码报工、设备维护和库存追溯的用户必经入口，当前覆盖率偏低。
- 问题：标签卡片选择已有鼠标路径，键盘选择和读屏状态需要验证；同时打印弹窗被拦截、QR 图片生成失败时会静默失败或产生未处理 Promise。
- 修复：标签卡片保留 `role="checkbox"`、`tabindex`、`aria-checked` 和键盘 Enter/Space 选择；新增 `printError` 告警，`window.open()` 返回空值时提示“标签打印窗口打开失败”，`QRCode.toDataURL()` 失败时提示“标签二维码生成失败”。
- 行为保持：原标签筛选、选择、QR canvas 预览、打印窗口内容和打印布局不变；只补齐键盘可达性证据和失败可见性。
- 测试：新增/扩展 TDD 用例 `lets keyboard users select trace labels for printing`、`alerts when the print window cannot be opened`、`alerts when QR images cannot be generated for printing`；后两者先红于缺少 alert/未处理异常，再最小修复。
- 验证：`npm run test:unit -- tests/unit/barcode-print-board.test.ts` 通过，`1 file / 3 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 382 tests passed`，总行覆盖率 `72.07%`，`BarcodePrintBoard.vue` 行覆盖率 `80.72%`。
- 验证：`npm run lint` 通过。

## ScannerBoard Scan Evidence Fail-loud Slice

- 选片依据：延续条码打印后的扫码验证闭环；`ScannerBoard.vue` 是现场扫码报工、设备点检、物料齐套进入证据链的用户必经入口。
- 问题：点击“确认并写入证据链”时，如果 `writeBarcodeScanEvidenceRecord()` 抛错，Vue 会出现未处理事件错误，页面没有 alert 告知用户扫码证据未归档。
- 修复：`scanError` 增加 `role="alert"`/`aria-live="assertive"`；`confirmScanEvidence()` 增加 `try/catch`，写入失败时提示“扫码证据写入失败”并保留未确认状态，写入成功时清理旧错误。
- 行为保持：扫码查询、demo fallback、历史回放、上下文跳转和成功写入后后端优先刷新逻辑不变。
- 测试：新增 TDD 用例 `keeps scan evidence unconfirmed and alerts when evidence storage fails`，先红于缺少 `[role="alert"]` 和未处理事件异常，再最小修复。
- 验证：`npm run test:unit -- tests/unit/scanner-board.test.ts` 通过，`1 file / 3 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 383 tests passed`，总行覆盖率 `72.13%`，`ScannerBoard.vue` 行覆盖率 `71.31%`。
- 验证：`npm run lint` 通过。

## ScannerBoard Scan Evidence Refresh Fail-loud Slice

- 选片依据：继续 `ScannerBoard.vue` 现场扫码证据链；本地证据写入成功和后端刷新失败是两个不同状态，不能混为“写入失败”。
- 问题：`writeBarcodeScanEvidenceRecord()` 已成功后，如果 `readBarcodeScanEvidenceRecordsBackendFirst()` 抛错，页面会误报“扫码证据写入失败”，并且不展示已确认扫码证据。
- 修复：本地写入成功后立即把新 record 合入 `scanEvidenceRecords` 并清理写入错误；后端刷新单独 `try/catch`，失败时提示“扫码证据刷新失败”，同时保留已确认状态。
- 行为保持：本地写入失败仍提示“扫码证据写入失败”并保持未确认；后端刷新成功时仍以 `readBarcodeScanEvidenceRecordsBackendFirst()` 结果为准。
- 测试：新增 TDD 用例 `keeps locally written scan evidence confirmed when backend refresh fails`，先红于误报“写入失败”，再最小修复。
- 验证：`npm run test:unit -- tests/unit/scanner-board.test.ts` 通过，`1 file / 4 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 384 tests passed`，总行覆盖率 `72.14%`，`ScannerBoard.vue` 行覆盖率 `72.22%`。
- 验证：`npm run lint` 通过。

## ScannerBoard No-match Clears Stale Result Slice

- 选片依据：继续 `ScannerBoard.vue` 现场扫码路径；有效扫码后再扫无效码是现场试错高频动作，不能保留上一条结果误导操作员。
- 问题：先扫描 `WO-RUSH-9001`，再查询 `UNKNOWN-CODE` 时，页面显示“未找到”错误，但旧 `.scan-result` 仍保留“急单阀体组件”。
- 修复：无 backend 命中且 demo fallback 也无匹配时，将 `result.value` 清空，再显示未找到错误。
- 行为保持：有效扫码、demo fallback、扫码历史和证据确认逻辑不变；只清理无匹配时的旧结果。
- 测试：新增 TDD 用例 `clears the previous scan result when a later manual scan has no match`，先红于 `.scan-result` 仍存在，再最小修复。
- 验证：`npm run test:unit -- tests/unit/scanner-board.test.ts` 通过，`1 file / 5 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 385 tests passed`，总行覆盖率 `72.2%`，`ScannerBoard.vue` 行覆盖率 `76.37%`。
- 验证：`npm run lint` 通过。

## ScannerBoard Camera Stop Fail-loud Slice

- 选片依据：继续 `ScannerBoard.vue` 摄像头扫码路径；扫码成功后自动关闭摄像头是现场隐私和设备占用的关键反馈点。
- 问题：扫码成功后 `scanner.stop()` 抛错会被静默吞掉，页面已切回“开启摄像头”，但真实摄像头可能未释放。
- 修复：`stopScanner()` 捕获停止失败后写入 assertive `scanError`，提示“摄像头关闭失败”及底层错误。
- 行为保持：扫码结果、历史记录、摄像头启动失败处理和成功停止路径不变；关闭失败不撤销已识别的扫码结果。
- 测试：新增 TDD 用例 `alerts when the camera cannot be stopped after a successful scan`，先红于缺少 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/scanner-board.test.ts` 通过，`1 file / 6 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 386 tests passed`，总行覆盖率 `72.28%`，`ScannerBoard.vue` 行覆盖率 `82.03%`。
- 验证：`npm run lint` 通过。

## EquipmentBoard Filter Clears Stale Detail Slice

- 选片依据：按覆盖率杠杆转向 `EquipmentBoard.vue`；设备维护是现场设备状态、健康监控、维护记录和故障诊断的用户关键路径，当前覆盖率低于已完成的扫码/条码路径。
- 问题：用户打开某台设备详情后再切换状态或类型筛选，如果当前可见列表不再包含该设备，详情面板仍显示旧设备。
- 风险：设备列表和详情不一致，现场人员可能在筛选结果外的旧设备上继续查看健康、维护或诊断信息，造成维护判断错位。
- 修复：列表刷新和类型筛选变化后同步当前可见设备；若当前选中设备不在可见列表中，则清空详情、健康、维护和诊断状态；若仍可见，则用最新设备对象更新详情。
- 行为保持：筛选后仍可见的选中设备不会被误清空；设备统计、分页、审计定位和设备详情 tab 逻辑不变。
- 测试：新增 TDD 用例 `clears the selected equipment detail when status filters remove it from the list` 与 `clears the selected equipment detail when type filters hide it from the visible list`，均先红于旧详情残留，再最小修复。
- 验证：`npm run test:unit -- tests/unit/equipment-board.test.ts` 通过，`1 file / 3 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 388 tests passed`，总行覆盖率 `72.46%`，`EquipmentBoard.vue` 行覆盖率 `69.54%`。
- 验证：`npm run lint` 通过。
- B-track 核验：`gh auth status` 已登录 `zenweb` 且 scope 含 `repo/workflow`；`origin` 仍是腾讯工蜂 remote，Hosted CI 仍缺真实 GitHub repo/Actions run 证据。

## EquipmentBoard Health Fallback Fail-loud Slice

- 选片依据：继续 `EquipmentBoard.vue` 设备维护路径精品化；健康监控是维护人员判断停机、预防维护和故障风险的核心入口。
- 问题：`getHealthReport()` 失败时页面直接展示 demo 健康分、异常参数和预测故障，没有告知后端真实健康数据不可用。
- 风险：维护人员可能把演示兜底数据当成真实设备健康诊断，影响停机窗口、维修优先级和备件准备判断。
- 修复：新增 `equipmentError` assertive alert；健康数据加载成功时清理旧错误，失败 fallback 时提示“设备健康数据加载失败”并展示底层错误。
- 行为保持：健康 API 失败后仍沿用原 demo fallback 展示，不破坏当前可演示性；设备列表、筛选、详情 tab、维护记录和诊断逻辑不变。
- 测试：新增 TDD 用例 `alerts when health data falls back after the backend is unavailable`，先红于缺少 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/equipment-board.test.ts` 通过，`1 file / 4 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 389 tests passed`，总行覆盖率 `72.59%`，`EquipmentBoard.vue` 行覆盖率 `75.5%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## EquipmentBoard Maintenance Fallback Fail-loud Slice

- 选片依据：继续 `EquipmentBoard.vue` 设备维护路径；维护记录是现场判断保养历史、费用、备件和维修责任人的核心证据。
- 问题：`getMaintenanceHistory()` 失败时页面直接展示 demo 维护记录，没有告知后端真实维护历史不可用。
- 风险：维护人员可能把演示的季度保养/月度检查当成真实历史，影响维修复盘、备件消耗和责任追踪判断。
- 修复：复用 `equipmentError` assertive alert；维护记录加载成功时清理旧错误，失败 fallback 时提示“设备维护记录加载失败”并展示底层错误。
- 行为保持：维护 API 失败后仍沿用原 demo fallback 展示，不破坏当前可演示性；健康监控、故障诊断、设备列表和筛选逻辑不变。
- 测试：新增 TDD 用例 `alerts when maintenance records fall back after the backend is unavailable`，先红于缺少 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/equipment-board.test.ts` 通过，`1 file / 5 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 390 tests passed`，总行覆盖率 `72.65%`，`EquipmentBoard.vue` 行覆盖率 `78.21%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## EquipmentBoard Diagnosis Fallback Fail-loud Slice

- 选片依据：继续 `EquipmentBoard.vue` 设备维护路径；故障诊断是维护人员从错误码进入维修步骤、备件准备和停机评估的核心入口。
- 问题：`diagnose()` 失败时页面直接展示 demo 诊断原因、依据、步骤和备件，没有告知后端真实诊断不可用。
- 风险：维护人员可能把演示诊断当成真实 AI 分析结果，影响维修步骤、备件准备和停机时间判断。
- 修复：复用 `equipmentError` assertive alert；诊断成功时清理旧错误，失败 fallback 时提示“设备故障诊断失败”并展示底层错误。
- 行为保持：诊断 API 失败后仍沿用原 demo fallback 展示，不破坏当前可演示性；健康监控、维护记录、设备列表和筛选逻辑不变。
- 测试：新增 TDD 用例 `alerts when diagnosis falls back after the backend is unavailable`，先红于缺少 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/equipment-board.test.ts` 通过，`1 file / 6 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 391 tests passed`，总行覆盖率 `72.76%`，`EquipmentBoard.vue` 行覆盖率 `82.84%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## EquipmentBoard List Fallback Fail-loud Slice

- 选片依据：继续 `EquipmentBoard.vue` 设备维护入口；设备列表是进入健康监控、维护记录和故障诊断前的第一屏。
- 问题：`getEquipmentList()` 失败时页面直接展示 demo 设备列表，没有告知后端真实设备清单不可用。
- 风险：维护人员可能把演示 CNC 设备当成真实现场设备清单，影响设备状态核对、筛选和后续详情判断。
- 修复：复用 `equipmentError` assertive alert；列表加载成功时清理旧错误，失败 fallback 时提示“设备列表加载失败”并展示底层错误。
- 行为保持：设备列表 API 失败后仍沿用原 demo fallback 展示；健康监控、维护记录、故障诊断和筛选逻辑不变。
- 测试：新增 TDD 用例 `alerts when the equipment list falls back after the backend is unavailable`，先红于缺少 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/equipment-board.test.ts` 通过，`1 file / 7 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 392 tests passed`，总行覆盖率 `72.8%`，`EquipmentBoard.vue` 行覆盖率 `84.46%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## EquipmentBoard Statistics Fallback Fail-loud Slice

- 选片依据：继续 `EquipmentBoard.vue` 设备维护第一屏；KPI 统计是维护人员判断运行设备数、利用率和可动率的入口指标。
- 问题：`getEquipmentStatistics()` 失败时页面直接展示 demo KPI 数字，没有告知后端真实设备统计不可用。
- 风险：维护人员可能把演示的 `4/8`、`72%`、`95%` 当成真实现场指标，影响设备状态判断和维护优先级。
- 修复：统计失败时生成“设备统计加载失败”告警；列表加载成功不会清掉统计告警，列表自身失败时会与统计告警合并显示。
- 行为保持：统计 API 失败后仍沿用原 demo KPI fallback 展示；设备列表、详情 tab、筛选和审计定位逻辑不变。
- 测试：新增 TDD 用例 `alerts when equipment statistics fall back after the backend is unavailable`，先红于缺少 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/equipment-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 393 tests passed`，总行覆盖率 `72.82%`，`EquipmentBoard.vue` 行覆盖率 `85.23%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## EquipmentBoard Statistics Alert Persistence Slice

- 选片依据：继续精品化 `EquipmentBoard.vue` 的设备维护入口；统计 KPI 失败告警属于用户判断入口指标可信度的核心反馈。
- 问题：统计接口失败后，后续设备列表刷新成功可能清掉页面级告警，但 KPI 仍然是 demo fallback 值。
- 风险：维护人员会看到正常列表和兜底 KPI，却不知道运行设备数、利用率和可动率并非真实后端统计。
- 修复：将设备错误状态拆成统计、列表和详情三类；列表成功只清理列表错误，不能误清统计错误；详情成功只清理详情错误。
- 行为保持：统计、列表、详情多类失败时仍合并到同一个 assertive alert 展示；原 demo fallback 展示不变。
- 测试：新增 TDD 用例 `keeps the statistics fallback alert after a later equipment list refresh succeeds`，先红于统计告警被列表成功误清，再最小修复。
- 验证：`npm run test:unit -- tests/unit/equipment-board.test.ts` 通过，`1 file / 9 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 394 tests passed`，总行覆盖率 `72.83%`，`EquipmentBoard.vue` 行覆盖率 `85.44%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## ProductionBoard Barcode Start Evidence Fail-loud Slice

- 选片依据：按覆盖率杠杆转向 `ProductionBoard.vue`；生产报工是现场开工、扫码流转卡和 OTD 复盘证据链的用户必经路径，当前覆盖率低于已完成的设备维护路径。
- 问题：扫码上下文开工时，后端 `startOperation()` 已成功后，如果本地 OTD 开工证据写入抛错，页面会产生未处理异常，且没有提示扫码/OTD 证据未归档。
- 风险：现场人员可能只看到工序进入“生产中”，误以为扫码开工证据也已进入 OTD 复盘；后续完工、异常和报表审计会缺少开工证据根节点。
- 修复：后端开工成功后的本地状态、替班证据、扫码开工证据和执行轨迹写入统一包进 `try/catch`；证据写入失败时提示“开工证据写入失败，后端开工已提交但扫码/OTD 证据未归档”，并阻止成功通知。
- 行为保持：后端开工 API 失败仍走原“开工失败”提示；证据写入成功时原状态回写、扫码开工证据、排产回写轨迹和成功通知不变。
- 测试：新增 TDD 用例 `fails loud when barcode start evidence cannot be archived after backend start succeeds`，先红于未处理异常和缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/production-board.test.ts` 通过，`1 file / 18 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 395 tests passed`，总行覆盖率 `73.44%`，`ProductionBoard.vue` 行覆盖率 `71.82%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## ProductionBoard Labor Start Evidence Attribution Slice

- 选片依据：继续 `ProductionBoard.vue` 生产开工证据链精品化；人员替班开工是热处理等受资质约束工序的关键安全与审计路径。
- 问题：后端开工成功后，如果 `writeLaborReassignmentExecutionEvidence()` 抛错，页面虽然 fail loud，但文案只说“扫码/OTD 证据未归档”，没有点明人员替班证据也未归档。
- 风险：主管和现场人员可能以为只是扫码证据异常，漏判替班执行证据缺失；后续人员资质复核、审计回放和 OTD 复盘会缺少替班开工依据。
- 修复：将开工证据失败提示扩展为“人员替班/扫码/OTD 证据未归档”，与同一写入保护块实际覆盖的证据范围一致。
- 行为保持：后端开工 API 失败、扫码开工证据失败和开工成功路径不变；只修正证据失败的 fail-loud 归因。
- 测试：新增 TDD 用例 `identifies labor reassignment evidence failures after backend start succeeds`，先红于提示未包含“人员替班”，再最小修复。
- 验证：`npm run test:unit -- tests/unit/production-board.test.ts` 通过，`1 file / 19 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 396 tests passed`，总行覆盖率 `73.48%`，`ProductionBoard.vue` 行覆盖率 `72.37%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## ProductionBoard POC Pilot Evidence Fail-loud Slice

- 选片依据：继续 `ProductionBoard.vue` 生产执行路径；POC 试点证据是生产报工页面进入真实工单试点复盘的辅助证据，不能阻断核心工单列表。
- 问题：`readPocPilotRunRecordBackendFirst()` 抛错时，`applyPocPilotRunTrace()` 会让 mounted hook 出现未处理异常，且页面没有告知 POC 试点运行证据加载失败。
- 风险：生产报工主列表虽然已加载，但辅助证据失败被静默/异常化处理，现场和评审人员无法区分生产页面可用与 POC 试点证据不可用。
- 修复：为 `applyPocPilotRunTrace()` 增加 `try/catch`；失败时提示“POC 试点运行证据加载失败”并保留生产工单列表可用。
- 行为保持：POC 试点证据成功加载时原执行轨迹展示不变；无 POC 记录时仍安静返回。
- 测试：新增 TDD 用例 `keeps production work orders visible when POC pilot evidence loading fails`，先红于 mounted hook 未处理异常和缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/production-board.test.ts` 通过，`1 file / 20 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 397 tests passed`，总行覆盖率 `73.48%`，`ProductionBoard.vue` 行覆盖率 `72.52%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## QualityBoard MRB Evidence Fail-loud Slice

- 选片依据：按覆盖率杠杆转向 `QualityBoard.vue`；质量检验批次是生产质量闭环、返工、MRB 和 CAPA 的用户必经路径，当前覆盖率低于已连续提升的生产报工路径。
- 问题：`readQualityMrbDispositionRecordBackendFirst()` 抛错时，`refreshQualityMrbDisposition()` 会中断 mounted hook，导致质量统计、检验批次、异常和 SPC 初始化都无法继续加载。
- 风险：MRB 辅助证据不可用会拖垮质量页主路径，质量工程师看不到检验批次和根因分析入口，也没有失败提示。
- 修复：新增页面级 `qualityError` assertive alert；MRB 处置证据读取失败时提示“MRB 处置证据加载失败”，并保留 MRB 预览和后续主质量数据加载。
- 行为保持：MRB 证据成功加载时清理错误并维持原预览/记录逻辑；质量统计、检验批次、异常和 SPC 成功路径不变。
- 测试：新增 TDD 用例 `keeps inspection records visible when MRB disposition evidence loading fails`，先红于 mounted hook 未处理异常和主数据未加载，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 13 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 398 tests passed`，总行覆盖率 `73.5%`，`QualityBoard.vue` 行覆盖率 `65.3%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## QualityBoard Anomaly Fallback Fail-loud Slice

- 选片依据：继续 `QualityBoard.vue` 质量检验主路径；异常告警是质量工程师发现不合格、MRB 和 CAPA 风险的第一屏信号。
- 问题：`http.get('/anomaly')` 失败时页面直接展示 demo 异常列表，没有告知真实异常后端不可用。
- 风险：质量工程师可能把 demo 异常“装配后轴孔配合间隙”等当成真实质量告警，影响现场处置优先级。
- 修复：异常接口失败时复用页面级 `qualityError` assertive alert，提示“质量异常告警加载失败”并展示底层错误，同时保留原 fallback 异常列表。
- 行为保持：异常接口成功时仍使用后端 `data.items ?? data`；失败时继续保留演示可用性，但不再静默。
- 测试：新增 TDD 用例 `alerts while showing fallback anomalies when the anomaly API is unavailable`，先红于找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 14 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 399 tests passed`，总行覆盖率 `73.53%`，`QualityBoard.vue` 行覆盖率 `66.66%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## QualityBoard SPC Fallback Fail-loud Slice

- 选片依据：继续 `QualityBoard.vue` 质量监控入口；SPC 趋势分析是质量工程师判断过程波动和趋势异常的核心图表。
- 问题：`analyzeSpcTrend()` 抛错时页面直接生成 demo SPC 点位和趋势建议，没有告知真实 SPC 后端不可用。
- 风险：质量工程师可能把随机 fallback 趋势和建议当成真实过程控制结论，影响刀具、硬度或尺寸公差处置判断。
- 修复：当前 SPC 请求失败时复用页面级 `qualityError` assertive alert，提示“SPC 趋势分析加载失败”并展示底层错误；过期参数请求失败不会覆盖当前页面。
- 行为保持：SPC 失败后仍保留原 demo 图表 fallback，维持演示可用性；成功路径和旧请求门禁不变。
- 测试：新增 TDD 用例 `alerts while showing fallback SPC data when trend analysis is unavailable`，先红于 fallback 图表存在但找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 15 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 400 tests passed`，总行覆盖率 `73.68%`，`QualityBoard.vue` 行覆盖率 `72.17%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## QualityBoard Root Cause Fallback Fail-loud Slice

- 选片依据：继续 `QualityBoard.vue` 根因分析路径；根因分析是质量工程师从不合格检验进入纠正/预防措施的核心决策入口。
- 问题：`analyzeRootCause()` 抛错时页面直接展示 demo 根因、纠正措施和预防措施，没有告知真实 AI 根因分析不可用。
- 风险：质量工程师可能把 demo 的刀具磨损、冷却液和来料硬度判断当成真实 AI 分析结果，影响 MRB、CAPA 和现场返工处置。
- 修复：当前根因分析请求失败时复用页面级 `qualityError` assertive alert，提示“根因分析加载失败”并展示底层错误，同时保留原 fallback 分析。
- 行为保持：成功分析、同一检验 in-flight 复用、跨检验最新选择门禁和 demo fallback 内容不变；旧请求失败不会覆盖当前选择的告警。
- 测试：新增 TDD 用例 `alerts while showing fallback root cause analysis when AI analysis is unavailable`，先红于 fallback dialog 存在但找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 16 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 401 tests passed`，总行覆盖率 `73.71%`，`QualityBoard.vue` 行覆盖率 `73.2%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## QualityBoard SPC Success Clears Stale Alert Slice

- 选片依据：继续 `QualityBoard.vue` 质量错误清理边界；SPC 参数切换是质量工程师重试趋势分析的自然操作。
- 问题：SPC 后端失败后会显示“SPC 趋势分析加载失败”，但后续切换参数并成功加载趋势时，旧失败告警仍残留。
- 风险：用户会在已经看到有效 SPC 点位后继续被旧错误误导，以为当前参数的趋势分析仍不可用。
- 修复：SPC 成功写入图表后，仅当 `qualityError` 仍是“SPC 趋势分析加载失败”前缀时清理旧告警。
- 行为保持：不会清理 MRB、异常告警或根因分析产生的其他页面级错误；旧请求门禁和 SPC 成功/失败渲染不变。
- 测试：新增 TDD 用例 `clears the stale SPC fallback alert after a later trend analysis succeeds`，先红于成功后 `[role="alert"]` 仍存在，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 17 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 402 tests passed`，总行覆盖率 `73.71%`，`QualityBoard.vue` 行覆盖率 `73.3%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## QualityBoard Root Cause Success Clears Stale Alert Slice

- 选片依据：继续 `QualityBoard.vue` 质量错误清理边界；根因分析是质量工程师失败后切换批次重试的核心操作。
- 问题：根因分析失败后会显示“根因分析加载失败”，但后续选择另一个检验批次并成功返回真实根因分析时，旧失败告警仍残留。
- 风险：用户会在已经看到成功根因分析 dialog 后继续被旧错误误导，以为当前批次的根因分析仍不可用。
- 修复：`analyzeRootCause()` 真正成功返回时，仅当 `qualityError` 仍是“根因分析加载失败”前缀时清理旧告警；失败 fallback 不会立刻清掉自己的错误。
- 行为保持：不会清理 MRB、异常告警或 SPC 产生的其他页面级错误；根因分析失败 fallback、缓存、in-flight 复用和最新选择门禁不变。
- 测试：新增 TDD 用例 `clears the stale root cause fallback alert after a later analysis succeeds`，先红于成功后 `[role="alert"]` 仍存在，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 18 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 403 tests passed`，总行覆盖率 `73.72%`，`QualityBoard.vue` 行覆盖率 `73.51%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## QualityBoard MRB Disposition Archive Fail-loud Slice

- 选片依据：继续 `QualityBoard.vue` 质量证据归档边界；生成 MRB 报废补料决策是质量、排产和 OTD 复盘共享的关键证据动作。
- 问题：点击“生成 MRB 报废补料决策”时，如果 `writeQualityMrbDispositionRecord()` 抛错，Vue 事件处理会出现未处理异常，页面没有提示证据未归档。
- 风险：质量工程师可能以为 MRB 决策已生成，实际排产、报表、治理和审计回放缺少同一追踪号证据。
- 修复：`handleCreateMrbDisposition()` 增加 `try/catch`；写入失败时提示“MRB 处置证据写入失败”并保留未生成状态，成功时才刷新证据链和同步消息。
- 行为保持：成功生成 MRB 决策、预览记录和 OTD 证据刷新逻辑不变；成功时只清理同类旧写入错误。
- 测试：新增 TDD 用例 `fails loud when MRB disposition evidence cannot be archived`，先红于事件处理抛出 `MRB disposition storage unavailable`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 19 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 404 tests passed`，总行覆盖率 `73.78%`，`QualityBoard.vue` 行覆盖率 `75.78%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## QualityBoard MRB Disposition Closure Fail-loud Slice

- 选片依据：继续 `QualityBoard.vue` 的 MRB 证据闭环边界；“确认闭环”会影响隔离、补料 ETA、排产重建、客户说明和审计回放状态。
- 问题：点击 MRB 闭环时，如果 `closeQualityMrbDispositionRecord()` 抛错，Vue 事件处理会出现未处理异常，页面没有提示闭环证据未归档。
- 风险：质量工程师可能以为 MRB 处置已闭环，实际排产事件、OTD 证据链和审计回放仍停留在未闭环状态。
- 修复：`handleCloseMrbDisposition()` 增加 `try/catch`；闭环写入失败时提示“MRB 处置闭环写入失败”并保留原 open record，成功时才刷新证据链和闭环同步消息。
- 行为保持：成功闭环、MRB 预览、OTD 证据刷新逻辑不变；成功时只清理同类旧闭环写入错误。
- 测试：新增 TDD 用例 `fails loud when MRB disposition closure evidence cannot be archived`，先红于事件处理抛出 `MRB closure storage unavailable`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 20 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 405 tests passed`，总行覆盖率 `73.8%`，`QualityBoard.vue` 行覆盖率 `76.44%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## QualityBoard Knowledge Sample Archive Fail-loud Slice

- 选片依据：继续 `QualityBoard.vue` 的扫码质量门知识复用路径；“沉淀为 CAPA 知识样本”是后续同类缺陷处置草案的前置证据动作。
- 问题：点击“沉淀为 CAPA 知识样本”时，如果 `writeQualityKnowledgeSample()` 抛错，Vue native event 会出现未处理异常，页面没有提示质量知识证据未归档。
- 风险：质量工程师可能误以为扫码返工样本已沉淀，实际 CAPA 推荐、知识库引用和审计回放缺少同一条质量知识证据。
- 修复：`publishBarcodeQualityKnowledgeSample()` 增加 `try/catch`；写入失败时提示“质量知识样本写入失败”并保留未同步状态，成功时才刷新 OTD 证据和同步消息。
- 行为保持：成功发布质量知识样本、复用目标展示和 OTD 证据刷新逻辑不变；成功时只清理同类旧写入错误。
- 测试：新增 TDD 用例 `fails loud when barcode quality knowledge sample cannot be archived`，先红于 native event unhandled `quality knowledge storage unavailable` 且找不到 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 21 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 406 tests passed`，总行覆盖率 `73.92%`，`QualityBoard.vue` 行覆盖率 `80.53%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## QualityBoard Knowledge Reuse Draft Archive Fail-loud Slice

- 选片依据：继续 `QualityBoard.vue` 的扫码质量门知识复用路径；“生成同类缺陷处置草案”是质量样本沉淀后的下一步用户必经动作。
- 问题：点击“生成同类缺陷处置草案”时，如果 `writeQualityKnowledgeReuseDraft()` 抛错，Vue native event 会出现未处理异常，页面没有提示复用草案证据未归档。
- 风险：质量工程师可能误以为同类缺陷处置草案已生成，实际 CAPA 复用、复核入口、知识库引用和审计回放缺少草案证据。
- 修复：`generateQualityKnowledgeReuseDraft()` 增加 `try/catch`；写入失败时提示“质量知识复用草案写入失败”并保留待生成状态，成功时才刷新 OTD 证据和同步消息。
- 行为保持：成功生成复用草案、目标工单、匹配分、效果评分和 OTD 证据刷新逻辑不变；成功时只清理同类旧写入错误。
- 测试：新增 TDD 用例 `fails loud when barcode quality knowledge reuse draft cannot be archived`，先红于 native event unhandled `quality reuse draft storage unavailable` 且找不到 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 22 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 407 tests passed`，总行覆盖率 `74.01%`，`QualityBoard.vue` 行覆盖率 `83.39%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## QualityBoard Barcode Gate Release Archive Fail-loud Slice

- 选片依据：继续 `QualityBoard.vue` 的扫码质量门闭环路径；“复验通过并释放交接”会同时归档质量复验、交接释放、排产回写和标签解冻证据。
- 问题：点击“复验通过并释放交接”时，如果 `upsertOtdEvidenceChainRecord()` 抛错，Vue native event 会出现未处理异常，页面没有提示释放证据未归档。
- 风险：质量工程师可能误以为返工复验已放行、OP-20 可接收、排产窗口已恢复和标签已解冻，实际 OTD 证据链仍停留在冻结状态。
- 修复：`releaseBarcodeReworkGate()` 增加整体 `try/catch`；任一释放证据写入失败时提示“扫码质量门释放写入失败”并保留待放行状态，成功时才刷新 OTD 证据和成功消息。
- 行为保持：成功释放时原有 6 条冻结记录闭环和 4 条释放记录新增逻辑不变；成功时只清理同类旧释放写入错误。
- 测试：新增 TDD 用例 `fails loud when barcode quality gate release evidence cannot be archived`，先红于 native event unhandled `barcode release storage unavailable` 且找不到 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1 file / 23 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 408 tests passed`，总行覆盖率 `74.2%`，`QualityBoard.vue` 行覆盖率 `89.55%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。
