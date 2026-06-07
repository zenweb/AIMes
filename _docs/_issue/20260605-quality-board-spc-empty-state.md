# 2026-06-05 QualityBoard SPC Empty State Issues

## Resolved

- 问题：`QualityBoard.vue` 的 SPC 趋势分析在后端返回空 `dataPoints` 时没有明确空态，现场用户会看到空图表区域。
- 风险：用户可能误判为图表渲染故障、数据加载失败或控制线有效但检测点缺失，影响质量监控判断。
- 处理：新增 `spc-empty-state`，当 `spcData` 为空时显示 `暂无 SPC 数据`。
- 验证：目标 unit、全量前端 unit coverage、lint 均通过。

- 问题：`QualityBoard.vue` 根因分析只缓存已完成结果，用户快速重复点击同一检验批次时会重复发起 AI 根因分析请求。
- 风险：浪费后端 AI 分析资源，可能造成重复审计记录、响应竞争和用户等待体验不稳定。
- 处理：新增同一检验 ID 的 in-flight 请求复用；同一请求完成后再写入缓存并清理 pending。
- 验证：目标 unit `1 file / 9 tests passed`，全量前端 unit coverage `81 files / 362 tests passed`，lint 通过。

- 问题：用户连续点击不同检验批次的根因分析时，先发出的慢请求可能在后完成并覆盖后点击的面板。
- 风险：质量工程师会看到与最新点击行不一致的根因分析，可能误判检验批次和处置建议。
- 处理：新增最新点击 ID 门禁，仅允许最后选择的检验批次更新当前 dialog；旧请求结果仍保留缓存。
- 验证：目标 unit `1 file / 10 tests passed`，全量前端 unit coverage `81 files / 363 tests passed`，lint 通过。

- 问题：SPC 参数快速切换时，旧参数请求后完成会覆盖新参数的图表、告警和建议。
- 风险：质量工程师可能以为当前下拉参数对应旧参数趋势，导致质量监控判断错位。
- 处理：`loadSpc()` 捕获请求参数，并在成功和 fallback 写入前校验仍是当前参数。
- 验证：目标 unit `1 file / 11 tests passed`，全量前端 unit coverage `81 files / 364 tests passed`，lint 通过。

- 问题：用户从一个已打开的根因分析切换到另一个未缓存检验批次时，旧 dialog 会在新请求等待期间继续显示。
- 风险：质量工程师可能误把旧批次根因、纠正措施和预防措施当成新批次分析。
- 处理：未命中缓存并发起新请求前先清空 `currentAnalysis`，避免旧面板残留。
- 验证：目标 unit `1 file / 12 tests passed`，全量前端 unit coverage `81 files / 365 tests passed`，lint 通过。

- 问题：`ProductionBoard.vue` 中选中生产中工单后切换到待生产筛选，若后端返回的新列表不包含原工单，右侧详情仍显示旧工单。
- 风险：操作员会在筛选结果和详情不一致的页面上继续开工、完工或异常上报，容易把操作施加到不可见的旧工单。
- 处理：工单列表刷新后同步选中工单；列表不再包含当前选中 ID 时清空详情和当前工序。
- 验证：目标 unit `1 file / 12 tests passed`，全量前端 unit coverage `81 files / 366 tests passed`，lint 通过。

- 问题：`ProductionBoard.vue` 状态筛选请求没有最新请求门禁，快速切换筛选时旧慢响应会覆盖新快响应。
- 风险：操作员当前看到的状态筛选和工单列表不一致，可能误判工单不存在或遗漏已完成/待生产工单。
- 处理：`loadWorkOrders()` 增加递增 request id，过期响应和过期错误都不再写入列表、totalCount 或 demo fallback。
- 验证：目标 unit `1 file / 13 tests passed`，全量前端 unit coverage `81 files / 367 tests passed`，lint 通过。

- 问题：`ProductionBoard.vue` 连续扫码没有最新请求门禁，旧扫码慢响应会覆盖新扫码快响应的工单详情和工序。
- 风险：操作员可能以为页面已定位到第二次扫码的实物，但实际详情/工序被第一次扫码覆盖，后续开工、完工或异常上报可能落到错误工单。
- 处理：`handleScan()` 增加递增 scan request id，过期成功和过期失败响应都不再继续写入页面状态。
- 验证：目标 unit `1 file / 14 tests passed`，全量前端 unit coverage `81 files / 368 tests passed`，lint 通过。

- 问题：`ProductionBoard.vue` 点选工单加载工序没有最新请求门禁，旧点选慢响应会覆盖新点选快响应的工序列表。
- 风险：右侧标题显示最新工单，但工序列表来自旧工单，操作员可能对错误工序执行开工、完工或异常上报。
- 处理：`selectWorkOrder()` 增加递增 selection request id，过期成功和过期 fallback 都不再写入 `currentOperations`。
- 验证：目标 unit `1 file / 15 tests passed`，全量前端 unit coverage `81 files / 369 tests passed`，lint 通过。

- 问题：点选新工单后，新工序加载期间旧工序仍显示在右侧操作区。
- 风险：操作员可能在标题已切换到新工单时误点上一工单工序的开工、完工或异常按钮。
- 处理：`selectWorkOrder()` 更新选中工单后立即清空 `currentOperations`，等待最新响应或 demo fallback 回填。
- 验证：目标 unit `1 file / 16 tests passed`，全量前端 unit coverage `81 files / 370 tests passed`，lint 通过。

- 问题：点选工单和扫码工单的请求门禁彼此独立，先点选慢工单再扫码快工单时，旧点选响应会覆盖扫码结果。
- 风险：页面标题显示扫码工单，但可操作工序来自点选旧工单，可能导致开工、完工、异常上报错单。
- 处理：扫码开始时递增点选请求门禁，让旧点选响应过期。
- 验证：目标 unit `1 file / 17 tests passed`，全量前端 unit coverage `81 files / 371 tests passed`，lint 通过。

- 问题：`ReportBoard.vue` 辅助证据读取失败会中断 mounted hook，导致后续主报表 dashboard 不加载。
- 风险：经营复盘页面会因为某个可选证据源故障而丢失核心生产、质量、设备、异常报表，影响 POC 复盘和导出判断。
- 处理：新增 `readOptionalReportEvidence()`，辅助证据失败时 fail loud 并返回 fallback，保证主报表继续加载。
- 验证：目标 unit `1 file / 3 tests passed`，全量前端 unit coverage `81 files / 372 tests passed`，lint 通过。

- 问题：`ReportBoard.vue` 的排产采纳反馈在后端读取失败时不会继续读取本地快照。
- 风险：调度员已采纳/拒绝 Agent 推荐的本地归档证据会从 OTD 复盘证据链消失，经营复盘可能误判人工确认链路未发生。
- 处理：新增 `readScheduleFeedbackReportEvidence()`，后端失败时 fail loud 并回退 `readScheduleFeedbackSnapshot()`。
- 验证：目标 unit `1 file / 4 tests passed`，全量前端 unit coverage `81 files / 373 tests passed`，lint 通过。

- 问题：`ReportBoard.vue` 的 POC 上线交付包生成在写入返回 `null` 时静默失败。
- 风险：项目经理已完成 POC 签署后无法判断上线交付包是否归档成功，可能把缺失的交付行动证据带入客户复盘。
- 处理：`handleGeneratePocRolloutPackage()` 对写入空值和异常 fail loud；只有成功写入后才展示交付包并刷新证据链。
- 验证：目标 unit `1 file / 5 tests passed`，全量前端 unit coverage `81 files / 374 tests passed`，lint 通过。

- 问题：`ReportBoard.vue` 的 POC 试点运行确认在写入返回 `null` 时静默失败。
- 风险：首批真实工单试点运行记录未归档时，项目经理无法判断试点闭环失败，可能把缺失的真实工单验证证据带入上线验收。
- 处理：`handleConfirmPocPilotRun()` 对写入空值和异常 fail loud；只有成功写入后才展示试点运行包并刷新证据链。
- 验证：目标 unit `1 file / 6 tests passed`，全量前端 unit coverage `81 files / 375 tests passed`，lint 通过。

- 问题：`ReportBoard.vue` 的 POC Hypercare 验收包生成在写入返回 `null` 时静默失败。
- 风险：正式上线 7 天稳定运行监控证据未归档时，项目经理无法判断 Hypercare 包生成失败，可能误以为上线验收证据已齐套。
- 处理：`handleGeneratePocHypercareAcceptance()` 对写入空值和异常 fail loud；只有成功写入后才展示 Hypercare 监控包并刷新证据链。
- 验证：目标 unit `1 file / 7 tests passed`，全量前端 unit coverage `81 files / 376 tests passed`，lint 通过。

- 问题：`ReportBoard.vue` 的 OTD KPI 承诺包生成在写入抛错时未处理异常，也没有页面提示。
- 风险：客户交付恢复承诺包未归档时，经营复盘页面会静默丢失客户可复盘承诺证据，用户只能看到按钮无响应。
- 处理：`handleGenerateOtdKpiCommitment()` 对客户承诺包和外协承诺包写入异常 fail loud；成功时才更新承诺包并刷新证据链。
- 验证：目标 unit `1 file / 8 tests passed`，全量前端 unit coverage `81 files / 377 tests passed`，lint 通过。

- 问题：`ReportBoard.vue` 的 CSV 导出在 `downloadCsv()` 抛错时未处理异常，也没有页面提示。
- 风险：经营复盘、POC 证据包或客户交付复盘 CSV 未下载时，用户可能误以为导出完成，导致证据交付链路缺口被隐藏。
- 处理：`handleExportCsv()` 对 CSV 下载异常 fail loud；成功导出后清理旧错误，失败时保留页面 alert。
- 验证：目标 unit `1 file / 9 tests passed`，全量前端 unit coverage `81 files / 378 tests passed`，lint 通过。

- 问题：`ReportBoard.vue` 的 Excel/PDF 导出在 anchor click 抛错时未处理异常，也没有页面提示。
- 风险：经营复盘或客户交付复盘文件未打开时，用户可能误以为 Excel/PDF 导出完成，导致线下交付材料缺失。
- 处理：新增 `handleReportFileExport()` 对 Excel/PDF 下载异常 fail loud；成功导出后清理旧错误，失败时按文件类型保留页面 alert。
- 验证：目标 unit `1 file / 11 tests passed`，全量前端 unit coverage `81 files / 380 tests passed`，lint 通过。

- 问题：`BarcodePrintBoard.vue` 标签卡片键盘选择和读屏状态缺少测试证据。
- 风险：现场人员无法用键盘稳定选择待打印标签，读屏用户也无法确认标签是否已选中。
- 处理：标签卡片使用 checkbox 语义、`aria-checked` 和 Enter/Space 键盘切换，并补目标测试。
- 验证：目标 unit `1 file / 3 tests passed`，全量前端 unit coverage `81 files / 382 tests passed`，lint 通过。

- 问题：`BarcodePrintBoard.vue` 打印弹窗打开失败时静默返回。
- 风险：浏览器弹窗策略拦截打印窗口后，现场贴标人员可能误以为标签已进入打印流程。
- 处理：`window.open()` 返回空值时写入 assertive `printError`，提示允许浏览器弹窗后重试。
- 验证：目标 unit `1 file / 3 tests passed`，全量前端 unit coverage `81 files / 382 tests passed`，lint 通过。

- 问题：`BarcodePrintBoard.vue` 批量打印 QR 图片生成失败时未处理 Promise，也没有页面提示。
- 风险：打印窗口可能停在空白/半成品状态，现场贴标人员无法知道 QR 标签未生成。
- 处理：`Promise.all(QRCode.toDataURL(...))` 增加 `catch`，失败时提示“标签二维码生成失败”并阻止 `print()`。
- 验证：目标 unit `1 file / 3 tests passed`，全量前端 unit coverage `81 files / 382 tests passed`，lint 通过。

- 问题：`ScannerBoard.vue` 确认扫码证据时，`writeBarcodeScanEvidenceRecord()` 抛错会成为未处理事件，页面没有提示。
- 风险：现场人员可能误以为工单到站/设备点检/物料批次证据已归档，实际 OTD 复盘证据链缺少扫码执行记录。
- 处理：`confirmScanEvidence()` 增加 `try/catch`；失败时通过 assertive `scanError` 提示“扫码证据写入失败”，并保持当前扫描结果未确认。
- 验证：目标 unit `1 file / 3 tests passed`，全量前端 unit coverage `81 files / 383 tests passed`，lint 通过。

- 问题：`ScannerBoard.vue` 本地扫码证据写入成功后，后端刷新失败会被误报为“扫码证据写入失败”。
- 风险：现场证据已写入本地和 OTD 复盘链，但用户看到写入失败会重复确认或误判证据缺失。
- 处理：本地写入成功后先更新当前证据状态；后端刷新失败只提示“扫码证据刷新失败”，不撤销已确认状态。
- 验证：目标 unit `1 file / 4 tests passed`，全量前端 unit coverage `81 files / 384 tests passed`，lint 通过。

- 问题：`ScannerBoard.vue` 有效扫码后再查无效码时，旧扫描结果仍显示。
- 风险：现场操作员可能看到“未找到”错误旁边仍展示上一工单/设备/物料详情，误把旧详情当成当前条码结果。
- 处理：无 backend 命中且 demo fallback 也无匹配时清空 `result.value`。
- 验证：目标 unit `1 file / 5 tests passed`，全量前端 unit coverage `81 files / 385 tests passed`，lint 通过。

- 问题：`ScannerBoard.vue` 摄像头扫码成功后，`scanner.stop()` 失败会被静默吞掉。
- 风险：页面已切回“开启摄像头”，但真实摄像头可能仍被占用，现场人员无法知道需要手动处理浏览器摄像头权限或刷新页面。
- 处理：`stopScanner()` 捕获停止失败并通过 assertive `scanError` 提示“摄像头关闭失败”。
- 验证：目标 unit `1 file / 6 tests passed`，全量前端 unit coverage `81 files / 386 tests passed`，lint 通过。

- 问题：`EquipmentBoard.vue` 打开设备详情后切换状态筛选，若新后端列表不含当前设备，详情仍显示旧设备。
- 风险：现场人员在“空闲/故障/维护”等筛选下仍看到筛选结果外的旧设备详情，可能误读设备状态、健康和维护记录。
- 处理：设备列表刷新后按当前可见列表同步选中设备；不可见时清空详情、健康、维护和诊断状态。
- 验证：目标 unit `1 file / 3 tests passed`，全量前端 unit coverage `81 files / 388 tests passed`，lint 通过。

- 问题：`EquipmentBoard.vue` 类型筛选只在前端计算可见卡片，隐藏当前选中设备时不会触发后端刷新同步，详情仍残留旧设备。
- 风险：设备卡片列表和详情面板不一致，维护人员可能以为当前类型筛选下仍有旧设备可操作。
- 处理：监听可见设备列表变化；当前选中设备不在 `filteredEquipment` 中时清空详情。
- 验证：目标 unit `1 file / 3 tests passed`，全量前端 unit coverage `81 files / 388 tests passed`，lint 通过。

- 问题：`EquipmentBoard.vue` 的健康监控在 `getHealthReport()` 失败时静默显示 demo fallback。
- 风险：维护人员可能把演示健康分、异常参数和预测故障当成真实设备诊断，影响停机维护和备件准备判断。
- 处理：新增 assertive `equipmentError`；健康数据失败时提示“设备健康数据加载失败”及底层错误，成功时清理旧错误。
- 验证：目标 unit `1 file / 4 tests passed`，全量前端 unit coverage `81 files / 389 tests passed`，lint 通过。

- 问题：`EquipmentBoard.vue` 的维护记录在 `getMaintenanceHistory()` 失败时静默显示 demo fallback。
- 风险：维护人员可能把演示保养记录当成真实维护历史，影响保养复盘、备件消耗和维修责任判断。
- 处理：复用 assertive `equipmentError`；维护记录失败时提示“设备维护记录加载失败”及底层错误，成功时清理旧错误。
- 验证：目标 unit `1 file / 5 tests passed`，全量前端 unit coverage `81 files / 390 tests passed`，lint 通过。

- 问题：`EquipmentBoard.vue` 的故障诊断在 `diagnose()` 失败时静默显示 demo fallback。
- 风险：维护人员可能把演示诊断原因、维修步骤和备件建议当成真实 AI 诊断，影响停机维修决策。
- 处理：复用 assertive `equipmentError`；诊断失败时提示“设备故障诊断失败”及底层错误，成功时清理旧错误。
- 验证：目标 unit `1 file / 6 tests passed`，全量前端 unit coverage `81 files / 391 tests passed`，lint 通过。

- 问题：`EquipmentBoard.vue` 的设备列表在 `getEquipmentList()` 失败时静默显示 demo fallback。
- 风险：维护人员可能把演示 CNC 设备当成真实现场清单，影响设备筛选、状态核对和详情判断。
- 处理：复用 assertive `equipmentError`；设备列表失败时提示“设备列表加载失败”及底层错误，成功时清理旧错误。
- 验证：目标 unit `1 file / 7 tests passed`，全量前端 unit coverage `81 files / 392 tests passed`，lint 通过。

- 问题：`EquipmentBoard.vue` 的 KPI 统计在 `getEquipmentStatistics()` 失败时静默显示 demo fallback。
- 风险：维护人员可能把演示运行设备数、利用率和可动率当成真实现场指标，影响维护优先级和异常判断。
- 处理：统计失败时提示“设备统计加载失败”及底层错误；列表成功不清掉统计告警，避免入口指标错误被后续成功请求掩盖。
- 验证：目标 unit `1 file / 8 tests passed`，全量前端 unit coverage `81 files / 393 tests passed`，lint 通过。

- 问题：`EquipmentBoard.vue` 的统计 fallback 告警会被后续列表刷新成功误清，但 KPI 仍是演示兜底值。
- 风险：维护人员可能看到列表刷新正常就误以为统计 KPI 也已恢复，继续把 `4/8`、`72%` 等兜底指标当成真实现场数据。
- 处理：拆分 `equipmentStatisticsError`、`equipmentListError`、`equipmentDetailError`，列表成功只清列表错误，详情成功只清详情错误，统计错误保留到统计接口成功为止。
- 验证：目标 unit `1 file / 9 tests passed`，全量前端 unit coverage `81 files / 394 tests passed`，lint 通过。

- 问题：`ProductionBoard.vue` 的扫码上下文开工在后端开工成功后，如果扫码/OTD 开工证据归档抛错，会产生未处理异常且没有页面提示。
- 风险：现场人员可能误以为生产中状态、扫码开工证据和 OTD 复盘根节点都已闭环，实际后续完工、异常和报表审计缺少开工证据。
- 处理：后端开工成功后的本地状态、替班证据、扫码开工证据和执行轨迹写入增加统一 `try/catch`；证据失败时 fail loud，且不显示成功通知。
- 验证：目标 unit `1 file / 18 tests passed`，全量前端 unit coverage `81 files / 395 tests passed`，lint 通过。

- 问题：`ProductionBoard.vue` 的人员替班开工证据写入失败时，告警只提示“扫码/OTD 证据未归档”，没有明确人员替班执行证据也缺失。
- 风险：主管可能误判替班执行已闭环，只处理扫码证据问题；热处理资质替班、审计回放和 OTD 复盘会缺少替班开工依据。
- 处理：将开工证据失败提示扩展为“人员替班/扫码/OTD 证据未归档”，与实际保护的证据写入范围一致。
- 验证：目标 unit `1 file / 19 tests passed`，全量前端 unit coverage `81 files / 396 tests passed`，lint 通过。

- 问题：`ProductionBoard.vue` 的 POC 试点运行证据读取失败时会让 mounted hook 抛出未处理异常，且页面没有提示辅助证据不可用。
- 风险：生产工单主列表可用但 POC 试点证据缺失被异常吞没，现场和评审人员无法判断真实工单试点复盘证据是否加载成功。
- 处理：`applyPocPilotRunTrace()` 捕获 `readPocPilotRunRecordBackendFirst()` 错误，fail loud 后保留生产工单列表可用。
- 验证：目标 unit `1 file / 20 tests passed`，全量前端 unit coverage `81 files / 397 tests passed`，lint 通过。

- 问题：`QualityBoard.vue` 的 MRB 处置证据后端优先读取失败时会中断 mounted hook，导致质量统计和检验批次不再加载。
- 风险：MRB 辅助证据故障会拖垮质量检验主路径，质量工程师看不到检验记录、根因分析入口和 SPC 趋势，也没有明确失败提示。
- 处理：`refreshQualityMrbDisposition()` 捕获 `readQualityMrbDispositionRecordBackendFirst()` 错误，通过 assertive alert fail loud，并继续后续主数据加载。
- 验证：目标 unit `1 file / 13 tests passed`，全量前端 unit coverage `81 files / 398 tests passed`，lint 通过。

- 问题：`QualityBoard.vue` 的异常告警接口失败时静默展示 demo fallback 异常。
- 风险：质量工程师可能把 demo 异常当成真实异常告警，影响不合格处置、MRB 和 CAPA 优先级判断。
- 处理：异常接口失败时通过 assertive alert 提示“质量异常告警加载失败”及底层错误，同时保留 fallback 异常列表维持页面可用。
- 验证：目标 unit `1 file / 14 tests passed`，全量前端 unit coverage `81 files / 399 tests passed`，lint 通过。

- 问题：`QualityBoard.vue` 的 SPC 趋势分析接口失败时静默展示 demo fallback 图表。
- 风险：质量工程师可能把随机 fallback 趋势和建议当成真实过程控制结论，影响现场质量处置判断。
- 处理：当前 SPC 请求失败时通过 assertive alert 提示“SPC 趋势分析加载失败”及底层错误，同时保留 fallback SPC 点位维持页面可用。
- 验证：目标 unit `1 file / 15 tests passed`，全量前端 unit coverage `81 files / 400 tests passed`，lint 通过。

- 问题：`QualityBoard.vue` 的根因分析接口失败时静默展示 demo fallback 根因、纠正措施和预防措施。
- 风险：质量工程师可能把演示根因分析当成真实 AI 判断，影响 MRB、CAPA、返工和预防措施决策。
- 处理：当前根因分析请求失败时通过 assertive alert 提示“根因分析加载失败”及底层错误，同时保留 fallback dialog 维持页面可用。
- 验证：目标 unit `1 file / 16 tests passed`，全量前端 unit coverage `81 files / 401 tests passed`，lint 通过。

- 问题：`QualityBoard.vue` 的 SPC 趋势分析失败告警在后续成功请求后仍残留。
- 风险：用户已经看到当前参数的有效 SPC 点位，却仍被旧失败提示误导，以为当前趋势分析不可用。
- 处理：SPC 成功写入图表后只清理同类“SPC 趋势分析加载失败”旧告警，不误清其他质量错误。
- 验证：目标 unit `1 file / 17 tests passed`，全量前端 unit coverage `81 files / 402 tests passed`，lint 通过。

- 问题：`QualityBoard.vue` 的根因分析失败告警在后续成功请求后仍残留。
- 风险：用户已经看到成功根因分析 dialog，却仍被旧失败提示误导，以为当前批次根因分析不可用。
- 处理：`analyzeRootCause()` 真正成功返回时只清理同类“根因分析加载失败”旧告警；失败 fallback 不清理自身告警。
- 验证：目标 unit `1 file / 18 tests passed`，全量前端 unit coverage `81 files / 403 tests passed`，lint 通过。

- 问题：`QualityBoard.vue` 生成 MRB 报废补料决策时，证据写入失败会变成未处理事件异常且页面无提示。
- 风险：质量工程师可能误以为 MRB 决策已归档，实际排产、报表、治理和审计回放缺少同一追踪号证据。
- 处理：`handleCreateMrbDisposition()` 捕获写入异常，提示“MRB 处置证据写入失败”，并保持 `record` 为空防止伪成功。
- 验证：目标 unit `1 file / 19 tests passed`，全量前端 unit coverage `81 files / 404 tests passed`，lint 通过。

- 问题：`QualityBoard.vue` 关闭 MRB 处置时，闭环证据写入失败会变成未处理事件异常且页面无提示。
- 风险：质量工程师可能误以为 MRB 已闭环，实际隔离、补料 ETA、排产重建、客户说明和审计回放证据仍未归档。
- 处理：`handleCloseMrbDisposition()` 捕获闭环写入异常，提示“MRB 处置闭环写入失败”，并保留原 open record 防止伪闭环。
- 验证：目标 unit `1 file / 20 tests passed`，全量前端 unit coverage `81 files / 405 tests passed`，lint 通过。

- 问题：`QualityBoard.vue` 沉淀扫码返工 CAPA 知识样本时，样本证据写入失败会变成未处理 native event 异常且页面无提示。
- 风险：质量工程师可能误以为质量知识样本已归档，实际 CAPA 推荐、知识库引用、同类缺陷复用和审计回放缺少证据。
- 处理：`publishBarcodeQualityKnowledgeSample()` 捕获样本写入异常，提示“质量知识样本写入失败”，并保持 `.sample-synced` 不渲染防止伪成功。
- 验证：目标 unit `1 file / 21 tests passed`，全量前端 unit coverage `81 files / 406 tests passed`，lint 通过。

- 问题：`QualityBoard.vue` 生成同类缺陷处置草案时，复用草案证据写入失败会变成未处理 native event 异常且页面无提示。
- 风险：质量工程师可能误以为同类缺陷草案已归档，实际 CAPA 复用、复核入口、知识库引用和审计回放缺少草案证据。
- 处理：`generateQualityKnowledgeReuseDraft()` 捕获草案写入异常，提示“质量知识复用草案写入失败”，并保持 `.reuse-draft-result` 不渲染防止伪成功。
- 验证：目标 unit `1 file / 22 tests passed`，全量前端 unit coverage `81 files / 407 tests passed`，lint 通过。

- 问题：`QualityBoard.vue` 释放扫码质量门时，OTD 释放证据写入失败会变成未处理 native event 异常且页面无提示。
- 风险：质量工程师可能误以为返工复验已放行、OP-20 接收已释放、排产窗口已恢复、流转卡标签已解冻，实际证据链仍未闭环。
- 处理：`releaseBarcodeReworkGate()` 捕获释放证据写入异常，提示“扫码质量门释放写入失败”，并保持待放行 banner 与无成功消息状态防止伪成功。
- 验证：目标 unit `1 file / 23 tests passed`，全量前端 unit coverage `81 files / 408 tests passed`，lint 通过。

## Remaining

- `QualityBoard.vue` 仍有未覆盖分支，后续继续按“低覆盖 + 用户必经 + 业务关键”选择真实行为缺口；优先查异常告警成功后错误清理、MRB 成功闭环后的更多状态边界和扫码质量门释放成功后的显示完整性。
- `ProductionBoard.vue` 仍有未覆盖分支，后续优先查开完工证据归档、异常上报和分页边界的真实错误恢复缺口。
- `ReportBoard.vue` 仍有未覆盖分支，后续优先查导出成功后的用户反馈、POC 交付包生成和 OTD 承诺包错误恢复。
- `BarcodePrintBoard.vue` 剩余未覆盖分支可继续查打印成功后的清理、筛选后已选项可见性和标签状态证据链。
- `ScannerBoard.vue` 剩余未覆盖分支可继续查上下文跳转可访问性、初始化证据刷新失败和摄像头启动失败提示细节。
- `EquipmentBoard.vue` 剩余未覆盖分支可继续查健康/维护/诊断成功后错误清理的更多边界、分页异常和统计/列表双失败合并显示细节。
- B-track 发布门仍缺真实 GitHub repo/Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- 当前 `gh auth` 已登录 `zenweb` 且 scope 含 `repo/workflow`，但 `origin` 仍是腾讯工蜂，且 `gh repo view zenweb/AIMes` 仍无法解析仓库；Hosted CI 证据仍需真实 GitHub remote 和 Actions run。
