# 2026-06-05 QualityBoard SPC Empty State Review

## Review

- 审计结论：本片修复 `QualityBoard.vue` SPC 空数据时静默空白的问题，属于现有质量看板精品化，而不是新增功能范围。
- 行为覆盖：当 `analyzeSpcTrend()` 返回空 `dataPoints` 且未报错时，页面必须显示 `暂无 SPC 数据`。
- 行为边界：后端报错仍沿用现有 demo fallback；后端返回有效点位时不显示空态。
- TDD 证据：目标测试先失败于 `.spc-empty-state` 不存在，生产代码添加空态后变绿。
- 验证证据：目标 unit `1 file / 8 tests passed`；全量前端 unit coverage `81 files / 361 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.78%`，`QualityBoard.vue` 行覆盖率 `61.40%`。
- 发布边界：本片只推进 A-track 前端质量证据；Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察仍未关闭。

## Root Cause In-flight Dedupe Review

- 审计结论：本片修复 `QualityBoard.vue` 根因分析快速重复点击造成重复 AI 分析请求的问题，属于现有质量闭环可靠性打磨。
- 行为覆盖：同一检验批次第一次 `analyzeRootCause()` 未完成时，再次点击必须复用同一个 in-flight Promise。
- 行为保持：请求完成后仍写入 `analysisMap`；关闭 dialog 后重开仍复用已缓存结果；API 失败仍走原 demo 分析 fallback。
- TDD 证据：新增测试先失败于 `analyzeRootCause` 被调用 2 次，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 9 tests passed`；全量前端 unit coverage `81 files / 362 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.81%`，`QualityBoard.vue` 行覆盖率 `62.82%`。
- 发布边界：本片不替代 Hosted CI、staging、人工攻击链验证、安全签字、首次灰度或 14 天观察。

## Root Cause Latest Selection Race Review

- 审计结论：本片修复跨检验批次根因分析请求竞态，确保用户后点击的检验记录不会被旧慢请求覆盖。
- 行为覆盖：先点击 `INS-SLOW-001`、再点击 `INS-FAST-001` 时，即使 slow 请求后完成，dialog 仍必须显示 `INS-FAST-001`。
- 行为保持：slow 请求结果仍可进入缓存，不丢失分析结果；只禁止它覆盖当前可见面板。
- TDD 证据：新增测试先失败于 dialog 被 `INS-SLOW-001` 覆盖，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 10 tests passed`；全量前端 unit coverage `81 files / 363 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.83%`，`QualityBoard.vue` 行覆盖率 `63.44%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 B-track 发布闸门。

## SPC Latest Parameter Race Review

- 审计结论：本片修复 SPC 参数快速切换时旧请求覆盖新参数图表的问题，属于现有质量监控路径可靠性打磨。
- 行为覆盖：初始 `surface_roughness` 请求未完成时切到 `hardness`，即使粗糙度请求后完成，页面仍显示硬度趋势和建议。
- 行为保持：当前参数请求正常更新图表、告警和建议；非当前参数返回值只被忽略。
- TDD 证据：新增测试先失败于 `表面粗糙度趋势` 覆盖 `硬度趋势`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 11 tests passed`；全量前端 unit coverage `81 files / 364 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.86%`，`QualityBoard.vue` 行覆盖率 `64.58%`。
- 发布边界：本片不替代 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度或 14 天观察。

## Root Cause Stale Dialog Clear Review

- 审计结论：本片修复切换根因分析批次时旧 dialog 残留的问题，避免等待新请求期间展示错误批次结果。
- 行为覆盖：先打开 `INS-OLD-001`，再点击未缓存的 `INS-NEW-001` 时，新请求未返回前 dialog 必须消失。
- 行为保持：缓存命中不被清空；新请求完成后仍显示新批次分析。
- TDD 证据：新增测试先失败于旧 dialog 仍存在，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 12 tests passed`；全量前端 unit coverage `81 files / 365 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.86%`，`QualityBoard.vue` 行覆盖率 `64.73%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 B-track 发布闸门。

## ProductionBoard Stale Selection Filter Review

- 审计结论：本片修复生产报工筛选后详情 stale 的正确性问题，属于现有生产执行路径精品化。
- 行为覆盖：选中 `in_progress` 工单后切换到 `pending` 筛选，若新列表只返回待生产工单，右侧详情必须回到“选择工单或扫码开始”，不能继续显示旧工单。
- 行为保持：刷新后仍存在于列表中的选中工单会被同步为最新对象，不强制丢失有效选择。
- TDD 证据：新增测试先失败于 `.detail-title-row h3` 仍存在，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 12 tests passed`；全量前端 unit coverage `81 files / 366 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.91%`，`ProductionBoard.vue` 行覆盖率 `60.45%`。
- 发布边界：本片只推进 A-track 前端质量证据；GH 登录已恢复，但 Hosted CI 仍因缺真实 GitHub repo/remote/Actions run 未关闭。

## ProductionBoard Latest Filter Request Race Review

- 审计结论：本片修复生产报工状态筛选请求竞态，防止旧响应覆盖最新筛选结果。
- 行为覆盖：先发起 `pending` 慢请求，再切到 `completed` 并获得快响应；即使 `pending` 后完成，页面仍必须保留 `WO-COMPLETED` 列表结果。
- 行为保持：过期请求只是被忽略；最新请求失败时仍按原逻辑加载 demo 并 fail loud。
- TDD 证据：新增测试先失败于 `.wo-card` 变为 0 条，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 13 tests passed`；全量前端 unit coverage `81 files / 367 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.92%`，`ProductionBoard.vue` 行覆盖率 `60.75%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ProductionBoard Latest Scan Request Race Review

- 审计结论：本片修复生产报工连续扫码竞态，防止旧扫码响应覆盖最新扫码定位。
- 行为覆盖：先扫 `WO-SLOW-OP-SLOW` 慢响应，再扫 `WO-FAST-OP-FAST` 快响应；即使 slow 后完成，详情和工序仍必须保持 `WO-FAST / OP-FAST`。
- 行为保持：最新扫码响应仍正常定位工单并通知；过期响应只被忽略，不新增 loading 状态或接口契约。
- TDD 证据：新增测试先失败于详情被 `WO-SLOW` 覆盖，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 14 tests passed`；全量前端 unit coverage `81 files / 368 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.93%`，`ProductionBoard.vue` 行覆盖率 `61.04%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ProductionBoard Latest Work-order Selection Race Review

- 审计结论：本片修复生产报工点选工单加载工序竞态，防止右侧工单详情和工序列表错位。
- 行为覆盖：先点 `WO-SELECT-SLOW` 慢响应，再点 `WO-SELECT-FAST` 快响应；即使 slow 后完成，标题和工序仍必须保持 `WO-SELECT-FAST / OP-SELECT-FAST`。
- 行为保持：最新点选仍可走 API 或 demo fallback；过期点选响应只被忽略，不新增状态机或接口契约。
- TDD 证据：新增测试先失败于工序被 `OP-SELECT-SLOW` 覆盖，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 15 tests passed`；全量前端 unit coverage `81 files / 369 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.96%`，`ProductionBoard.vue` 行覆盖率 `61.52%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ProductionBoard Selection Loading Stale Operations Review

- 审计结论：本片修复点选新工单等待工序加载期间的旧工序残留，避免标题和可操作工序短暂错位。
- 行为覆盖：先加载 `WO-LOADED / OP-LOADED`，再点选 `WO-LOADING` 且新工序未返回时，页面不得继续显示旧 `.op-code`。
- 行为保持：`WO-LOADING` 响应返回后仍显示 `OP-LOADING`；过期响应门禁不变。
- TDD 证据：新增测试先失败于 `.op-code` 仍存在，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 16 tests passed`；全量前端 unit coverage `81 files / 370 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.96%`，`ProductionBoard.vue` 行覆盖率 `61.59%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ProductionBoard Manual Selection To Scan Race Review

- 审计结论：本片修复点选工单和扫码工单之间的跨入口竞态，防止旧点选响应覆盖最新扫码定位。
- 行为覆盖：先点 `WO-MANUAL-SLOW` 发起慢工序加载，再扫码 `WO-SCAN-FAST`；即使慢点选后完成，页面仍必须保持 `WO-SCAN-FAST / OP-SCAN-FAST`。
- 行为保持：单入口点选和单入口扫码逻辑不变；扫码开始只负责使旧点选请求失效。
- TDD 证据：新增测试先失败于工序被 `OP-MANUAL-SLOW` 覆盖，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 17 tests passed`；全量前端 unit coverage `81 files / 371 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.96%`，`ProductionBoard.vue` 行覆盖率 `61.66%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ReportBoard Optional Evidence Resilience Review

- 审计结论：本片修复报表中心辅助证据失败导致主报表不加载的问题，属于现有经营复盘路径可靠性打磨。
- 行为覆盖：客户工单导入证据读取失败时，页面必须继续调用 `getReportDashboard()` 并展示主 dashboard，同时通过 alert 暴露证据加载失败。
- 行为保持：辅助证据成功路径不变；主报表 API 失败仍使用原 demo 数据兜底。
- TDD 证据：新增测试先失败于 `getReportDashboard` 未调用并出现 mounted hook 未处理异常，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 3 tests passed`；全量前端 unit coverage `81 files / 372 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `70.98%`，`ReportBoard.vue` 行覆盖率 `62.17%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ReportBoard Schedule Feedback Local Fallback Review

- 审计结论：本片修复排产采纳反馈后端不可用时本地证据丢失的问题，强化 OTD 复盘证据链的连续性。
- 行为覆盖：`getLatestAdoptionFeedback()` 抛错时，页面仍必须调用 `readScheduleFeedbackSnapshot()`，并把本地快照展示为 OTD 证据链中的“人工采纳”卡片。
- 行为保持：后端记录优先级不变；本地无快照时仍为空；错误仍 fail loud 到页面 alert。
- TDD 证据：新增测试先失败于 `readScheduleFeedbackSnapshot` 未调用，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 4 tests passed`；全量前端 unit coverage `81 files / 373 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `71%`，`ReportBoard.vue` 行覆盖率 `62.63%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ReportBoard POC Rollout Fail-loud Review

- 审计结论：本片修复 POC 上线交付包写入失败时静默无反馈的问题，避免客户复盘链路误以为只是按钮未响应。
- 行为覆盖：POC 已签署但 `writePocRolloutPackageRecord()` 返回 `null` 时，页面必须提示“POC 上线交付包生成失败”，且不得展示“客户上线交付动作”包内容。
- 行为保持：成功写入后仍正常展示交付包并刷新 OTD 证据链；未签署时仍不会生成。
- TDD 证据：新增测试先失败于找不到 `[role="alert"]`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 5 tests passed`；全量前端 unit coverage `81 files / 374 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `71.02%`，`ReportBoard.vue` 行覆盖率 `63.11%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ReportBoard POC Pilot Run Fail-loud Review

- 审计结论：本片修复 POC 首批真实工单试点运行记录写入失败时静默无反馈的问题，避免试点闭环证据缺失被误认为已确认。
- 行为覆盖：已有 POC 上线交付包但 `writePocPilotRunRecord()` 返回 `null` 时，页面必须提示“POC 试点运行确认失败”，且不得展示“首批真实工单运行结果”。
- 行为保持：成功写入后仍正常展示试点运行包并刷新 OTD 证据链；无上线交付包时仍不会确认试点运行。
- TDD 证据：新增测试先失败于找不到 `[role="alert"]`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 6 tests passed`；全量前端 unit coverage `81 files / 375 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `71.06%`，`ReportBoard.vue` 行覆盖率 `63.75%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ReportBoard POC Hypercare Fail-loud Review

- 审计结论：本片修复 POC Hypercare 验收包写入失败时静默无反馈的问题，避免正式上线稳定运行证据缺失被误认为已生成。
- 行为覆盖：已有 POC 试点运行记录但 `writePocHypercareAcceptanceRecord()` 返回 `null` 时，页面必须提示“POC Hypercare 验收包生成失败”，且不得展示“Hypercare 稳定运行监控”。
- 行为保持：成功写入后仍正常展示 Hypercare 监控包并刷新 OTD 证据链；无试点运行记录时仍不会生成。
- TDD 证据：新增测试先失败于找不到 `[role="alert"]`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 7 tests passed`；全量前端 unit coverage `81 files / 376 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `71.1%`，`ReportBoard.vue` 行覆盖率 `64.55%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ReportBoard OTD KPI Commitment Fail-loud Review

- 审计结论：本片修复 OTD KPI 承诺包生成失败时未处理异常和无页面反馈的问题，避免客户承诺证据缺失被误认为按钮无响应。
- 行为覆盖：默认客户 KPI 下 `writeOtdKpiCommitmentPackage()` 抛错时，页面必须提示“OTD KPI 承诺包生成失败”，且不得展示 `.kpi-commitment-card`。
- 行为保持：成功写入后仍正常展示客户承诺包或外协承诺包并刷新 OTD 证据链；无选中 KPI 时仍不执行。
- TDD 证据：新增测试先失败于 Vue native event handler 未处理异常和缺少 `[role="alert"]`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 8 tests passed`；全量前端 unit coverage `81 files / 377 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `71.18%`，`ReportBoard.vue` 行覆盖率 `65.84%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ReportBoard CSV Export Fail-loud Review

- 审计结论：本片修复 CSV 导出失败时未处理异常和无页面反馈的问题，避免报表证据未下载却被用户误认为已完成。
- 行为覆盖：`downloadCsv()` 抛错时，页面必须提示“报表 CSV 导出失败”，并展示底层错误信息 `csv download unavailable`。
- 行为保持：CSV 行数据收集、OTD/POC/质量灰度/风险 SLA 等导出内容不变；成功导出仍调用原 `downloadCsv(csvFilename('报表'), headers, rows)`。
- TDD 证据：新增测试先失败于找不到 `[role="alert"]`，且 Vitest 捕获到 `csv download unavailable` 未处理事件异常；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 9 tests passed`；全量前端 unit coverage `81 files / 378 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `71.78%`，`ReportBoard.vue` 行覆盖率 `75.08%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ReportBoard Excel/PDF Export Fail-loud Review

- 审计结论：本片修复 Excel/PDF 导出失败时未处理异常和无页面反馈的问题，补齐报表中心三类导出按钮的一致 fail-loud 行为。
- 行为覆盖：Excel anchor click 抛错时提示“报表 Excel 导出失败”；PDF anchor click 抛错时提示“报表 PDF 导出失败”；两个提示都展示底层错误信息。
- 行为保持：Excel 仍指向 `/api/v1/report/export/excel` 并下载 `MES_Report.xlsx`；PDF 仍指向 `/api/v1/report/export/pdf` 并下载 `MES_Report.pdf`。
- TDD 证据：两个新增测试先失败于找不到 `[role="alert"]`，且 Vitest 分别捕获 `excel download unavailable`、`pdf download unavailable` 未处理事件异常；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 11 tests passed`；全量前端 unit coverage `81 files / 380 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `71.87%`，`ReportBoard.vue` 行覆盖率 `76.52%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## BarcodePrintBoard Keyboard And Print Fail-loud Review

- 审计结论：本片补齐条码打印入口的键盘选择证据和打印失败告警，避免现场贴标人员在弹窗被拦截或 QR 生成失败时误以为标签已进入打印。
- 行为覆盖：键盘用户可用 Enter 选择标签并看到 `aria-checked` 变为 `true`；`window.open()` 返回 `null` 时页面提示“标签打印窗口打开失败”；`QRCode.toDataURL()` 抛错时页面提示“标签二维码生成失败”且不调用 `print()`。
- 行为保持：鼠标点选、筛选、选中计数、打印窗口 HTML/CSS、标签内容和 QR 预览逻辑不变。
- TDD 证据：打印窗口失败测试先失败于缺少 `[role="alert"]`；QR 生成失败测试先失败于缺少 `[role="alert"]` 且 Vitest 捕获未处理 rejection；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 3 tests passed`；全量前端 unit coverage `81 files / 382 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.07%`，`BarcodePrintBoard.vue` 行覆盖率 `80.72%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ScannerBoard Scan Evidence Fail-loud Review

- 审计结论：本片修复扫码现场证据写入失败时未处理异常和无页面反馈的问题，避免用户误以为扫码到站证据已进入 OTD 复盘链。
- 行为覆盖：手动扫描 `WO-RUSH-9001` 后，`writeBarcodeScanEvidenceRecord()` 抛错时页面必须提示“扫码证据写入失败”，展示底层错误，并保持面板为“确认工单到站并进入报工入口”的未确认状态。
- 行为保持：键盘开启摄像头、历史回放、demo fallback、扫码结果字段和上下文动作不变；成功写入仍刷新 `readBarcodeScanEvidenceRecordsBackendFirst()`。
- TDD 证据：新增测试先失败于找不到 `[role="alert"]`，且 Vitest 捕获 `scan evidence storage unavailable` 未处理事件异常；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 3 tests passed`；全量前端 unit coverage `81 files / 383 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.13%`，`ScannerBoard.vue` 行覆盖率 `71.31%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ScannerBoard Scan Evidence Refresh Fail-loud Review

- 审计结论：本片修复扫码证据本地写入成功后，后端刷新失败被误归类为写入失败的问题，避免用户误判现场证据未归档。
- 行为覆盖：手动扫描并确认 `WO-RUSH-9001` 后，`readBarcodeScanEvidenceRecordsBackendFirst()` 抛错时页面提示“扫码证据刷新失败”，同时 `.field-evidence-panel` 保持 `synced` 并显示“WO-RUSH-9001 工单扫码到站已确认”。
- 行为保持：本地写入失败仍保持未确认；后端刷新成功时仍用后端优先记录刷新当前证据状态。
- TDD 证据：新增测试先失败于 alert 文案为“扫码证据写入失败”，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 4 tests passed`；全量前端 unit coverage `81 files / 384 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.14%`，`ScannerBoard.vue` 行覆盖率 `72.22%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ScannerBoard No-match Clears Stale Result Review

- 审计结论：本片修复无效扫码后旧扫描结果残留的问题，避免现场操作员把上一条有效工单误认为当前无效码的结果。
- 行为覆盖：先手动扫描 `WO-RUSH-9001` 显示“急单阀体组件”，再扫描 `UNKNOWN-CODE` 后必须显示未找到 alert，且 `.scan-result` 不存在。
- 行为保持：有效扫码和历史回放不变；无匹配时仍展示原“未找到”文案，只额外清空旧结果。
- TDD 证据：新增测试先失败于 `.scan-result` 仍为 `true`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 5 tests passed`；全量前端 unit coverage `81 files / 385 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.2%`，`ScannerBoard.vue` 行覆盖率 `76.37%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ScannerBoard Camera Stop Fail-loud Review

- 审计结论：本片修复摄像头扫码成功后停止失败被静默吞掉的问题，避免页面状态和真实摄像头占用状态不一致。
- 行为覆盖：摄像头回调识别 `WO-RUSH-9001` 后，`scanner.stop()` 抛错时页面必须提示“摄像头关闭失败”，保留“急单阀体组件”扫码结果。
- 行为保持：扫码成功、历史记录、摄像头启动失败、无效码清理旧结果和证据确认逻辑不变。
- TDD 证据：新增测试先失败于找不到 `[role="alert"]`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 6 tests passed`；全量前端 unit coverage `81 files / 386 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.28%`，`ScannerBoard.vue` 行覆盖率 `82.03%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## EquipmentBoard Filter Clears Stale Detail Review

- 审计结论：本片修复设备维护页筛选后详情 stale 的正确性问题，属于现有设备管理路径精品化。
- 行为覆盖：先打开 `CNC-001 加工中心` 详情，再切到只返回 `idle` 设备的状态筛选时，详情面板必须消失。
- 行为覆盖：先打开 `ASM-001 装配线` 详情，再切到 `CNC` 类型筛选时，详情面板必须消失。
- 行为保持：当前选中设备仍在可见列表中时，详情会同步为最新对象，不会被误清空。
- TDD 证据：两个新增测试分别先失败于 `.detail-panel` 仍存在，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 3 tests passed`；全量前端 unit coverage `81 files / 388 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.46%`，`EquipmentBoard.vue` 行覆盖率 `69.54%`。
- 发布边界：`gh` 已可用，但当前 remote 仍不是 GitHub；本片不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## EquipmentBoard Health Fallback Fail-loud Review

- 审计结论：本片修复设备健康监控后端失败时静默展示 demo fallback 的问题，避免真实数据不可用被隐藏。
- 行为覆盖：打开 `CNC-001` 详情并切到“健康监控”时，如果 `getHealthReport()` 抛错，页面必须显示 `[role="alert"]`，包含“设备健康数据加载失败”和底层错误信息。
- 行为保持：失败后仍展示原健康 fallback 的“健康分”和预测故障信息；成功加载健康数据时清理旧错误。
- TDD 证据：新增测试先失败于找不到 `[role="alert"]`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 4 tests passed`；全量前端 unit coverage `81 files / 389 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.59%`，`EquipmentBoard.vue` 行覆盖率 `75.5%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## EquipmentBoard Maintenance Fallback Fail-loud Review

- 审计结论：本片修复设备维护记录后端失败时静默展示 demo fallback 的问题，避免真实维护历史不可用被隐藏。
- 行为覆盖：打开 `CNC-001` 详情并切到“维护记录”时，如果 `getMaintenanceHistory()` 抛错，页面必须显示 `[role="alert"]`，包含“设备维护记录加载失败”和底层错误信息。
- 行为保持：失败后仍展示原维护记录 fallback 的“季度保养”等 demo 记录；成功加载维护记录时清理旧错误。
- TDD 证据：新增测试先失败于找不到 `[role="alert"]`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 5 tests passed`；全量前端 unit coverage `81 files / 390 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.65%`，`EquipmentBoard.vue` 行覆盖率 `78.21%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## EquipmentBoard Diagnosis Fallback Fail-loud Review

- 审计结论：本片修复设备故障诊断后端失败时静默展示 demo fallback 的问题，避免真实诊断不可用被隐藏。
- 行为覆盖：打开 `CNC-001` 详情并切到“故障诊断”后，如果 `diagnose()` 抛错，页面必须显示 `[role="alert"]`，包含“设备故障诊断失败”和底层错误信息。
- 行为保持：失败后仍展示原诊断 fallback 的“可能原因”等 demo 诊断结果；成功诊断时清理旧错误。
- TDD 证据：新增测试先失败于找不到 `[role="alert"]`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 6 tests passed`；全量前端 unit coverage `81 files / 391 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.76%`，`EquipmentBoard.vue` 行覆盖率 `82.84%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## EquipmentBoard List Fallback Fail-loud Review

- 审计结论：本片修复设备列表后端失败时静默展示 demo fallback 的问题，避免真实设备清单不可用被隐藏。
- 行为覆盖：进入设备维护页时，如果 `getEquipmentList()` 抛错，页面必须显示 `[role="alert"]`，包含“设备列表加载失败”和底层错误信息。
- 行为保持：失败后仍展示原列表 fallback 的两台 CNC demo 设备；成功加载列表时清理旧错误。
- TDD 证据：新增测试先失败于找不到 `[role="alert"]`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 7 tests passed`；全量前端 unit coverage `81 files / 392 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.8%`，`EquipmentBoard.vue` 行覆盖率 `84.46%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## EquipmentBoard Statistics Fallback Fail-loud Review

- 审计结论：本片修复设备 KPI 统计后端失败时静默展示 demo fallback 的问题，避免真实统计不可用被隐藏。
- 行为覆盖：进入设备维护页时，如果 `getEquipmentStatistics()` 抛错，页面必须显示 `[role="alert"]`，包含“设备统计加载失败”和底层错误信息。
- 行为保持：失败后仍展示原 KPI fallback 的 `4/8` 和 `72%`；列表加载成功不会误清掉统计告警。
- TDD 证据：新增测试先失败于找不到 `[role="alert"]`，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 8 tests passed`；全量前端 unit coverage `81 files / 393 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.82%`，`EquipmentBoard.vue` 行覆盖率 `85.23%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## EquipmentBoard Statistics Alert Persistence Review

- 审计结论：本片修复统计 fallback 告警会被后续列表成功请求误清的问题，避免入口 KPI 的兜底状态被掩盖。
- 行为覆盖：`getEquipmentStatistics()` 抛错后，即使 `getEquipmentList()` 后续成功返回真实列表，页面仍必须保留“设备统计加载失败”告警。
- 行为保持：失败后仍展示原 KPI fallback 的 `4/8` 和 `72%`；列表成功只证明设备清单可用，不代表统计 KPI 已恢复。
- TDD 证据：新增测试先失败于 `[role="alert"]` 被列表成功清掉，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 9 tests passed`；全量前端 unit coverage `81 files / 394 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `72.83%`，`EquipmentBoard.vue` 行覆盖率 `85.44%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ProductionBoard Barcode Start Evidence Fail-loud Review

- 审计结论：本片修复扫码开工证据写入失败时未处理异常和无页面提示的问题，避免后端开工成功掩盖 OTD 证据未归档。
- 行为覆盖：扫码 `WO-RUSH-9001` 建立扫码上下文后执行“按扫码上下文开工”；`startOperation()` 成功，但 `upsertOtdEvidenceChainRecord()` 抛错时必须显示 `[role="alert"]`。
- 行为保持：失败提示必须包含“开工证据写入失败，后端开工已提交但扫码/OTD 证据未归档”和底层错误；页面不能显示“已开工”成功通知或“已写入生产开工证据”。
- TDD 证据：新增测试先失败于 Vue native event handler 未处理异常、找不到 alert；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 18 tests passed`；全量前端 unit coverage `81 files / 395 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.44%`，`ProductionBoard.vue` 行覆盖率 `71.82%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ProductionBoard Labor Start Evidence Attribution Review

- 审计结论：本片修复人员替班开工证据失败提示归因不完整的问题，避免资质替班证据缺口被误读成单纯扫码证据异常。
- 行为覆盖：`WO-013` 热处理工序存在已批准替班时，`startOperation()` 成功但 `writeLaborReassignmentExecutionEvidence()` 抛错，页面必须显示 `[role="alert"]`。
- 行为保持：失败提示必须包含“人员替班/扫码/OTD 证据未归档”和底层错误；页面不能显示“已开工：淬火”成功通知。
- TDD 证据：新增测试先失败于 alert 文案只包含“扫码/OTD”，修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 19 tests passed`；全量前端 unit coverage `81 files / 396 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.48%`，`ProductionBoard.vue` 行覆盖率 `72.37%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## ProductionBoard POC Pilot Evidence Fail-loud Review

- 审计结论：本片修复 POC 试点证据读取失败时 mounted hook 未处理异常的问题，避免辅助证据失败污染生产报工主路径。
- 行为覆盖：`getWorkOrders()` 成功返回工单，`readPocPilotRunRecordBackendFirst()` 抛错时，页面仍必须显示生产工单 `WO-POC-EVIDENCE`。
- 行为保持：页面必须显示 `[role="alert"]`，包含“POC 试点运行证据加载失败”和底层错误；POC 证据成功加载/无记录路径不变。
- TDD 证据：新增测试先失败于 Vue mounted hook 未处理异常、找不到 alert；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 20 tests passed`；全量前端 unit coverage `81 files / 397 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.48%`，`ProductionBoard.vue` 行覆盖率 `72.52%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## QualityBoard MRB Evidence Fail-loud Review

- 审计结论：本片修复 MRB 辅助证据读取失败会中断质量页初始化的问题，避免辅助证据失败拖垮质量检验主路径。
- 行为覆盖：`readQualityMrbDispositionRecordBackendFirst()` 抛错后，`getQualityStatistics()` 和 `getInspections()` 仍必须执行，检验表仍显示 `WO-FAIL-001`。
- 行为保持：页面必须显示 `[role="alert"]`，包含“MRB 处置证据加载失败”和底层错误；MRB 成功加载/无记录路径不变。
- TDD 证据：新增测试先失败于 mounted hook 未处理异常、统计/检验 API 未被调用；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 13 tests passed`；全量前端 unit coverage `81 files / 398 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.5%`，`QualityBoard.vue` 行覆盖率 `65.3%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## QualityBoard Anomaly Fallback Fail-loud Review

- 审计结论：本片修复异常告警后端不可用时静默展示 demo fallback 的问题，避免演示异常被误读为真实现场告警。
- 行为覆盖：`http.get('/anomaly')` 抛错后，页面仍显示 fallback 异常列表，同时必须显示 `[role="alert"]`，包含“质量异常告警加载失败”和底层错误。
- 行为保持：后端异常接口成功时仍优先展示真实返回；失败时不阻断质量统计、检验批次、根因分析和 SPC 初始化。
- TDD 证据：新增测试先失败于 fallback 异常存在但找不到 alert；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 14 tests passed`；全量前端 unit coverage `81 files / 399 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.53%`，`QualityBoard.vue` 行覆盖率 `66.66%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## QualityBoard SPC Fallback Fail-loud Review

- 审计结论：本片修复 SPC 趋势分析后端不可用时静默展示 demo fallback 的问题，避免随机趋势图被误读为真实过程控制数据。
- 行为覆盖：`analyzeSpcTrend()` 抛错后，页面仍显示 fallback SPC 点位，同时必须显示 `[role="alert"]`，包含“SPC 趋势分析加载失败”和底层错误。
- 行为保持：当前参数失败时才显示告警和 fallback；过期参数请求失败不会覆盖当前参数结果；后端成功路径不变。
- TDD 证据：新增测试先失败于 fallback 点位存在但找不到 alert；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 15 tests passed`；全量前端 unit coverage `81 files / 400 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.68%`，`QualityBoard.vue` 行覆盖率 `72.17%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## QualityBoard Root Cause Fallback Fail-loud Review

- 审计结论：本片修复根因分析后端不可用时静默展示 demo fallback 的问题，避免演示分析被误读为真实 AI 根因判断。
- 行为覆盖：`analyzeRootCause()` 抛错后，页面仍显示 fallback 根因分析 dialog，同时必须显示 `[role="alert"]`，包含“根因分析加载失败”和底层错误。
- 行为保持：当前选择失败时才显示告警；旧请求失败不会覆盖当前选择；成功分析、缓存和 in-flight 复用不变。
- TDD 证据：新增测试先失败于 fallback dialog 存在但找不到 alert；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 16 tests passed`；全量前端 unit coverage `81 files / 401 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.71%`，`QualityBoard.vue` 行覆盖率 `73.2%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## QualityBoard SPC Success Clears Stale Alert Review

- 审计结论：本片修复 SPC 后续成功请求不能清理旧 fallback 告警的问题，避免已恢复的数据路径仍显示过期失败状态。
- 行为覆盖：`analyzeSpcTrend()` 先失败后，用户切换到 `hardness` 且趋势分析成功时，页面不应继续显示 `[role="alert"]`。
- 行为保持：只清理 SPC 同类旧告警，不清理 MRB、异常告警或根因分析错误；成功图表仍显示 3 个点位。
- TDD 证据：新增测试先失败于成功后 alert 仍存在；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 17 tests passed`；全量前端 unit coverage `81 files / 402 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.71%`，`QualityBoard.vue` 行覆盖率 `73.3%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## QualityBoard Root Cause Success Clears Stale Alert Review

- 审计结论：本片修复根因分析后续成功请求不能清理旧 fallback 告警的问题，避免已恢复的分析路径仍显示过期失败状态。
- 行为覆盖：`analyzeRootCause()` 先对 `INS-ROOT-FAIL` 失败后，用户选择 `INS-ROOT-OK` 且分析成功时，页面不应继续显示 `[role="alert"]`。
- 行为保持：只清理根因分析同类旧告警，不清理 MRB、异常告警或 SPC 错误；失败 fallback 仍保留自己的告警。
- TDD 证据：新增测试先失败于成功后 alert 仍存在；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 18 tests passed`；全量前端 unit coverage `81 files / 403 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.72%`，`QualityBoard.vue` 行覆盖率 `73.51%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## QualityBoard MRB Disposition Archive Fail-loud Review

- 审计结论：本片修复 MRB 处置证据生成失败时未处理异常的问题，避免关键质量决策证据缺失被隐藏。
- 行为覆盖：`writeQualityMrbDispositionRecord()` 抛错时，组件事件不应继续向外抛出异常，页面必须显示 `[role="alert"]`。
- 行为保持：失败提示包含“MRB 处置证据写入失败”和底层错误；`QualityMrbDispositionPanel` 的 `record` 仍为 `null`，不伪造成功记录。
- TDD 证据：新增测试先失败于 Vue 事件处理抛出 `MRB disposition storage unavailable`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 19 tests passed`；全量前端 unit coverage `81 files / 404 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.78%`，`QualityBoard.vue` 行覆盖率 `75.78%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## QualityBoard MRB Disposition Closure Fail-loud Review

- 审计结论：本片修复 MRB 处置闭环写入失败时未处理异常的问题，避免关键闭环证据缺失被隐藏。
- 行为覆盖：`closeQualityMrbDispositionRecord()` 抛错时，组件事件不应继续向外抛出异常，页面必须显示 `[role="alert"]`。
- 行为保持：失败提示包含“MRB 处置闭环写入失败”和底层错误；`QualityMrbDispositionPanel` 的 `record` 保持原 `open` 状态，不伪造闭环成功。
- TDD 证据：新增测试先失败于 Vue 事件处理抛出 `MRB closure storage unavailable`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 20 tests passed`；全量前端 unit coverage `81 files / 405 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.8%`，`QualityBoard.vue` 行覆盖率 `76.44%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## QualityBoard Knowledge Sample Archive Fail-loud Review

- 审计结论：本片修复扫码质量知识样本写入失败时未处理异常的问题，避免 CAPA 知识复用前置证据缺失被隐藏。
- 行为覆盖：`writeQualityKnowledgeSample()` 抛错时，native click 事件不应留下未处理异常，页面必须显示 `[role="alert"]`。
- 行为保持：失败提示包含“质量知识样本写入失败”和底层错误；`.sample-synced` 不渲染，用户仍停留在可重试的“沉淀为 CAPA 知识样本”状态。
- TDD 证据：新增测试先失败于 native event unhandled `quality knowledge storage unavailable` 且找不到 alert；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 21 tests passed`；全量前端 unit coverage `81 files / 406 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `73.92%`，`QualityBoard.vue` 行覆盖率 `80.53%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## QualityBoard Knowledge Reuse Draft Archive Fail-loud Review

- 审计结论：本片修复扫码质量知识复用草案写入失败时未处理异常的问题，避免同类缺陷处置草案证据缺失被隐藏。
- 行为覆盖：`writeQualityKnowledgeReuseDraft()` 抛错时，native click 事件不应留下未处理异常，页面必须显示 `[role="alert"]`。
- 行为保持：失败提示包含“质量知识复用草案写入失败”和底层错误；`.reuse-draft-result` 不渲染，用户仍停留在可重试的“生成同类缺陷处置草案”状态。
- TDD 证据：新增测试先失败于 native event unhandled `quality reuse draft storage unavailable` 且找不到 alert；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 22 tests passed`；全量前端 unit coverage `81 files / 407 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.01%`，`QualityBoard.vue` 行覆盖率 `83.39%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## QualityBoard Barcode Gate Release Archive Fail-loud Review

- 审计结论：本片修复扫码质量门释放写入失败时未处理异常的问题，避免返工复验放行证据缺失被隐藏。
- 行为覆盖：`upsertOtdEvidenceChainRecord()` 抛错时，native click 事件不应留下未处理异常，页面必须显示 `[role="alert"]`。
- 行为保持：失败提示包含“扫码质量门释放写入失败”和底层错误；释放 banner 保持“返工复验待放行”，`.barcode-release-message` 不渲染，防止伪成功。
- TDD 证据：新增测试先失败于 native event unhandled `barcode release storage unavailable` 且找不到 alert；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 23 tests passed`；全量前端 unit coverage `81 files / 408 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.2%`，`QualityBoard.vue` 行覆盖率 `89.55%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。
