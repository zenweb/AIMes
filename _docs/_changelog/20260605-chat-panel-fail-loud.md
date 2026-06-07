# 2026-06-05 ChatPanel Fail-loud Changelog

## Delivery Recovery Package Navigation Failure Slice

- 选片依据：按覆盖率杠杆重新排序，`ChatPanel.vue` 当前行覆盖率 `56.14%`，低于多数主组件；AI 生产助手是主布局高频入口，交期恢复执行包属于跨排产、风险、采购、质量和审计的关键出口。
- 问题：交期恢复执行包已写入后，如果 `router.push('/scheduling')` 失败，外层 catch 会把整个动作记录为 `permitted: false`，并提示“动作执行失败”。
- 风险：业务包已经生成，但用户和审计看到的是动作失败，后续可能重复生成执行包或误判交期恢复闭环未启动。
- 修复：交期恢复执行包生成后，路由跳转失败只作为二级 alert 提示“交期恢复执行包已生成，但页面跳转失败：...”，不再覆盖已完成动作和成功审计。
- 行为保持：路由成功时仍打开 AI 排产；成功审计失败仍按既有路径显示“动作已执行，但成功审计写入失败”。
- 测试：新增 TDD 用例 `keeps the completed delivery recovery package visible when navigation fails`，先红于 `recordAssistantActionAudit` 被调用为 `permitted: false`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 19 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 435 tests passed`，总行覆盖率 `75.42%`，`ChatPanel.vue` 行覆盖率 `56.55%`。
- 验证：`npm run lint` 通过。

## Anomaly Disposition Package Navigation Failure Slice

- 问题：异常处置卡已写入后，如果 `router.push('/anomaly')` 失败，外层 catch 会把整个动作记录为 `permitted: false`，并提示“动作执行失败”。
- 风险：异常处置卡已经创建，但用户和审计看到的是动作失败，现场可能重复创建处置卡或误判异常闭环未启动。
- 修复：异常处置卡创建后，路由跳转失败只作为二级 alert 提示“异常处置卡已创建，但页面跳转失败：...”，不再覆盖已完成动作和成功审计。
- 行为保持：路由成功时仍打开异常管理；成功审计失败仍按既有路径显示“动作已执行，但成功审计写入失败”。
- 测试：新增 TDD 用例 `keeps the completed anomaly disposition package visible when navigation fails`，先红于 `recordAssistantActionAudit` 被调用为 `permitted: false`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 20 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 436 tests passed`，总行覆盖率 `75.44%`，`ChatPanel.vue` 行覆盖率 `56.95%`。
- 验证：`npm run lint` 通过。

## Engineering Constraint Package Navigation Failure Slice

- 问题：工程约束复核包已写入后，如果 `router.push('/scheduling')` 失败，外层 catch 会把整个动作记录为 `permitted: false`，并提示“动作执行失败”。
- 风险：工程约束复核包已经生成，但用户和审计看到的是动作失败，后续可能重复生成复核包或误判 BOM、ECN、工艺路线和质量门责任动作未启动。
- 修复：工程约束复核包生成后，路由跳转失败只作为二级 alert 提示“工程约束复核包已生成，但页面跳转失败：...”，不再覆盖已完成动作和成功审计。
- 行为保持：路由成功时仍打开 AI 排产；成功审计失败仍按既有路径显示“动作已执行，但成功审计写入失败”。
- 测试：新增 TDD 用例 `keeps the completed engineering constraint package visible when navigation fails`，先红于 `recordAssistantActionAudit` 被调用为 `permitted: false`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 21 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 437 tests passed`，总行覆盖率 `75.45%`，`ChatPanel.vue` 行覆盖率 `57.35%`。
- 验证：`npm run lint` 通过。

## Customer Commitment Package Navigation Failure Slice

- 问题：客户交付恢复承诺包已写入后，如果 `router.push('/report')` 失败，外层 catch 会把整个动作记录为 `permitted: false`，并提示“动作执行失败”。
- 风险：客户承诺包已经生成，但用户和审计看到的是动作失败，后续可能重复生成承诺包或误判客户交付恢复口径未输出。
- 修复：客户交付恢复承诺包生成后，路由跳转失败只作为二级 alert 提示“客户交付恢复承诺包已生成，但页面跳转失败：...”，不再覆盖已完成动作和成功审计。
- 行为保持：路由成功时仍打开报表中心；成功审计失败仍按既有路径显示“动作已执行，但成功审计写入失败”。
- 测试：新增 TDD 用例 `keeps the completed customer commitment package visible when navigation fails`，先红于 `recordAssistantActionAudit` 被调用为 `permitted: false`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 22 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 438 tests passed`，总行覆盖率 `75.46%`，`ChatPanel.vue` 行覆盖率 `57.74%`。
- 验证：`npm run lint` 通过。

## BOM Kitting Package Navigation Failure Slice

- 问题：BOM 展开齐套检查包和 OTD 证据已写入后，如果 `router.push('/bom')` 失败，外层 catch 会把整个动作记录为 `permitted: false`，并提示“动作执行失败”。
- 风险：BOM 齐套包和 OTD 证据已经生成，但用户和审计看到的是动作失败，后续可能重复生成齐套包或误判缺料/替代料复核未启动。
- 修复：BOM 齐套包生成后，路由跳转失败只作为二级 alert 提示“BOM 齐套包已生成，但页面跳转失败：...”，不再覆盖已完成动作和成功审计。
- 行为保持：OTD 证据写入失败仍按既有路径显示“BOM 齐套包已生成，但 OTD 证据写入失败”；路由成功时仍打开 BOM 管理。
- 测试：新增 TDD 用例 `keeps the completed BOM kitting package visible when navigation fails`，先校正 OTD 证据断言，再红于 `recordAssistantActionAudit` 被调用为 `permitted: false`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 23 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 439 tests passed`，总行覆盖率 `75.48%`，`ChatPanel.vue` 行覆盖率 `58.12%`。
- 验证：`npm run lint` 通过。

## Equipment Downtime Package Navigation Failure Slice

- 问题：设备停机复核包和 OTD 证据已写入后，如果 `router.push('/equipment')` 失败，外层 catch 会把整个动作记录为 `permitted: false`，并提示“动作执行失败”。
- 风险：设备停机复核包和 OTD 证据已经生成，但用户和审计看到的是动作失败，后续可能重复生成停机包或误判维护窗口、替代设备和排产保护策略未启动。
- 修复：设备停机复核包生成后，路由跳转失败只作为二级 alert 提示“设备停机复核包已生成，但页面跳转失败：...”，不再覆盖已完成动作和成功审计。
- 行为保持：OTD 证据写入失败仍按既有路径显示“设备停机复核包已生成，但 OTD 证据写入失败”；路由成功时仍打开设备维护。
- 测试：新增 TDD 用例 `keeps the completed equipment downtime package visible when navigation fails`，先红于 `recordAssistantActionAudit` 被调用为 `permitted: false`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 24 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 440 tests passed`，总行覆盖率 `75.49%`，`ChatPanel.vue` 行覆盖率 `58.49%`。
- 验证：`npm run lint` 通过。

## OTD Report Export Navigation Failure Slice

- 问题：OTD/POC 复盘 CSV 已导出后，如果 `router.push('/report')` 失败，外层 catch 会把整个导出动作记录为 `permitted: false`，并提示“动作执行失败”。
- 风险：CSV 文件已经生成，但用户和审计看到的是动作失败，后续可能重复导出或误判报表复盘证据未产出。
- 修复：CSV 导出完成后，报表中心跳转失败只作为二级 alert 提示“OTD/POC 复盘 CSV 已生成，但报表中心跳转失败：...”，不再覆盖已完成导出和成功审计。
- 行为保持：CSV 成功时仍创建 Blob、触发下载并释放 object URL；路由成功时仍打开报表中心；成功审计失败仍按既有路径显示“动作已执行，但成功审计写入失败”。
- 测试：新增 TDD 用例 `keeps the exported OTD report visible when report navigation fails`，先红于 `recordAssistantActionAudit` 被调用为 `permitted: false`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 25 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 441 tests passed`，总行覆盖率 `75.50%`，`ChatPanel.vue` 行覆盖率 `58.86%`。
- 验证：`npm run lint` 通过。

## OTD Report Export Cleanup Failure Slice

- 问题：OTD/POC 复盘 CSV 已触发下载后，如果 `URL.revokeObjectURL()` 清理失败，外层 catch 会把整个导出动作记录为 `permitted: false`，并提示“动作执行失败”。
- 风险：下载动作已经触发，但用户和审计看到的是动作失败，后续可能重复导出；同时清理失败原因没有被单独暴露。
- 修复：`exportActionReport()` 在下载点击后捕获 object URL 清理失败并返回错误信息，动作层追加二级 alert “OTD/POC 复盘 CSV 已生成，但下载链接清理失败：...”，不再覆盖已完成导出和成功审计。
- 行为保持：Blob 创建或下载点击本身失败时仍走动作失败路径，因为导出尚未完成；清理成功时行为不变。
- 测试：新增 TDD 用例 `keeps the exported OTD report visible when object URL cleanup fails`，先红于 `recordAssistantActionAudit` 被调用为 `permitted: false`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 26 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 442 tests passed`，总行覆盖率 `75.52%`，`ChatPanel.vue` 行覆盖率 `59.29%`。
- 验证：`npm run lint` 通过。

## Startup Context Sync Failure Slice

- 问题：`ChatPanel.vue` mounted 阶段同步异常处置、现场态势和风险 SLA backend-first 上下文时，任意读取失败会在 `try` 外抛出 Vue unhandled error，聊天面板没有明确失败提示。
- 风险：AI 生产助手入口仍可打开，但用户不知道助手上下文没有完成同步；后续问答可能基于本地/空上下文回答，造成生产态势、异常调度或风险复核判断偏差。
- 修复：启动上下文同步失败时捕获异常，显示 `role="alert"` / `aria-live="assertive"` 的“助手上下文同步失败：...”提示，并保留聊天入口继续可用。
- 行为保持：上下文同步成功时仍缓存 backend-first 记录；LLM 状态读取仍按既有逻辑显示模型徽标，且失败时继续静默降级。
- 测试：新增 TDD 用例 `alerts instead of crashing when startup context sync fails`，先红于 mounted hook unhandled rejection 与缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 27 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 449 tests passed`，总行覆盖率 `75.90%`，`ChatPanel.vue` 行覆盖率 `59.44%`。
- 验证：`npm run lint` 通过。

## OTD Report Download Preparation Failure Slice

- 问题：OTD/POC 复盘 CSV 在 Blob URL 创建阶段失败时，通用失败文案只显示“动作执行失败：导出 OTD 复盘”，没有明确告知用户下载准备失败。
- 风险：导出尚未完成，但用户无法区分是报表业务动作失败、浏览器下载能力失败，还是后续页面跳转失败；独自 review 时也难以定位失败边界。
- 修复：`export_report` 在真正导出前失败时使用专用 fail-loud 文案“OTD/POC 复盘 CSV 下载准备失败：...”，继续记录失败审计，且不显示完成状态、不跳转报表中心。
- 行为保持：CSV 已触发下载后的报表中心跳转失败和下载链接清理失败仍保留完成状态与成功审计；其他动作仍使用通用“动作执行失败”文案。
- 测试：新增 TDD 用例 `alerts with a download preparation failure when report blob creation fails`，先红于缺失专用失败文案，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 28 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 450 tests passed`，总行覆盖率 `75.90%`，`ChatPanel.vue` 行覆盖率 `59.44%`。
- 验证：`npm run lint` 通过。

## OTD Report Download Click Failure Cleanup Slice

- 问题：OTD/POC 复盘 CSV 已创建 Blob URL 后，如果浏览器下载点击 `a.click()` 失败，异常会直接冒泡，`URL.revokeObjectURL(url)` 不会执行。
- 风险：导出尚未完成且页面会正确显示失败，但已创建的 Blob URL 没有释放；多次失败导出会累积浏览器资源泄漏，且独自 review 时难以看出失败边界。
- 修复：`a.click()` 失败时先尝试释放已创建的 object URL，再保留原始点击失败作为用户可见原因，仍显示“OTD/POC 复盘 CSV 下载准备失败：...”。
- 行为保持：点击成功后的清理失败仍作为“已生成 CSV，但下载链接清理失败”二级 alert；点击失败时不显示完成状态、不跳转报表中心，并记录失败审计。
- 测试：新增 TDD 用例 `releases the prepared report object URL when download click fails`，先红于 `URL.revokeObjectURL()` 未调用，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 29 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 451 tests passed`，总行覆盖率 `75.92%`，`ChatPanel.vue` 行覆盖率 `59.72%`。
- 验证：`npm run lint` 通过。

## Chat History Loading Failure Slice

- 问题：重新打开 AI 生产助手时，如果 `getChatHistory()` 失败，组件会静默显示空状态，没有告知用户历史消息未加载。
- 风险：用户可能误判历史会话为空，继续基于缺失上下文提问；独自 review 时也难以区分“没有历史”和“历史接口失败”。
- 修复：聊天历史加载失败时显示 `role="alert"` / `aria-live="assertive"` 的“聊天历史加载失败：...”提示，并保留聊天入口可继续发起新问答。
- 行为保持：历史加载成功时仍恢复历史消息；无历史消息时仍显示既有空状态；新问答发送流程不变。
- 测试：新增 TDD 用例 `alerts instead of showing an empty state silently when chat history loading fails`，先红于缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 30 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 452 tests passed`，总行覆盖率 `75.99%`，`ChatPanel.vue` 行覆盖率 `61.00%`。
- 验证：`npm run lint` 通过。

## LLM Status Loading Failure Slice

- 问题：`ChatPanel.vue` mounted 阶段读取 `getLlmStatus()` 失败时会静默忽略，只是不显示模型徽标。
- 风险：用户无法区分“模型状态未配置/接口异常”和“正常但无徽标”，可能在 LLM 状态不可观测时继续依赖 AI 生产助手。
- 修复：LLM 状态加载失败时显示 `role="alert"` / `aria-live="assertive"` 的“LLM 状态加载失败：...”提示，同时保留聊天入口继续可用。
- 行为保持：LLM 状态读取成功时仍显示既有模型徽标；失败时不阻断知识库问答或离线演示回答。
- 测试：新增 TDD 用例 `alerts instead of silently hiding the model badge when LLM status loading fails`，先红于缺失 alert，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 31 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 466 tests passed`，总行覆盖率 `76.27%`，`ChatPanel.vue` 行覆盖率 `61.07%`。
- 验证：`npm run lint` 通过。

## Startup Context Source-level Failure Slice

- 问题：`ChatPanel.vue` mounted 阶段把异常调度、现场态势和风险 SLA 三个 backend-first 上下文读取放在同一个 `try` 内；任一来源失败会短路后续来源。
- 风险：异常调度接口失败时，现场态势和风险 SLA 上下文不会被尝试加载，AI 生产助手会在可用证据被跳过的状态下继续回答。
- 修复：启动上下文读取改为来源级 fail-loud；每个来源独立捕获失败并降级为 fallback，失败来源显示“助手上下文同步失败：...”，其它来源继续加载。
- 行为保持：单个来源失败仍保留聊天入口；所有来源成功时仍缓存 backend-first 记录；LLM 状态读取逻辑不变。
- 测试：新增 TDD 用例 `continues loading other startup context sources when one source fails`，先红于后两个来源调用次数为 `0`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/chat-panel.test.ts` 通过，`1 file / 32 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 467 tests passed`，总行覆盖率 `76.28%`，`ChatPanel.vue` 行覆盖率 `61.2%`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 前端 AI 助手可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
- 2026-06-05 复核：`gh auth status` 已登录 `zenweb`，Docker Server `29.5.2` 可用；但当前 `origin` 仍是 `https://git.code.tencent.com/zenweb/AIMes.git`，`gh repo view` 因没有 GitHub remote 失败，`gh repo list zenweb` 未列出 `zenweb/AIMes`。
