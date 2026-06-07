# 2026-06-05 ChatPanel Next Actions

## Done

- 已完成：`ChatPanel.vue` 交期恢复执行包写入成功但页面跳转失败时 fail loud，避免已完成业务动作被误报为失败。
- 已完成：新增目标测试覆盖 `router.push('/scheduling')` 失败时保留完成状态、成功审计和跳转失败 alert。
- 已完成：`ChatPanel.vue` 异常处置卡写入成功但页面跳转失败时 fail loud，避免已完成异常闭环动作被误报为失败。
- 已完成：新增目标测试覆盖 `router.push('/anomaly')` 失败时保留完成状态、成功审计和跳转失败 alert。
- 已完成：`ChatPanel.vue` 工程约束复核包写入成功但页面跳转失败时 fail loud，避免已完成工程复核动作被误报为失败。
- 已完成：新增目标测试覆盖工程约束复核包 `router.push('/scheduling')` 失败时保留完成状态、成功审计和跳转失败 alert。
- 已完成：`ChatPanel.vue` 客户交付恢复承诺包写入成功但页面跳转失败时 fail loud，避免已完成客户承诺动作被误报为失败。
- 已完成：新增目标测试覆盖客户承诺包 `router.push('/report')` 失败时保留完成状态、成功审计和跳转失败 alert。
- 已完成：`ChatPanel.vue` BOM 齐套包和 OTD 证据写入成功但页面跳转失败时 fail loud，避免已完成齐套动作被误报为失败。
- 已完成：新增目标测试覆盖 BOM 齐套包 `router.push('/bom')` 失败时保留完成状态、成功审计和跳转失败 alert。
- 已完成：`ChatPanel.vue` 设备停机复核包和 OTD 证据写入成功但页面跳转失败时 fail loud，避免已完成停机复核动作被误报为失败。
- 已完成：新增目标测试覆盖设备停机包 `router.push('/equipment')` 失败时保留完成状态、成功审计和跳转失败 alert。
- 已完成：`ChatPanel.vue` OTD/POC 复盘 CSV 已导出但报表中心跳转失败时 fail loud，避免已完成导出动作被误报为失败。
- 已完成：新增目标测试覆盖 CSV 导出后 `router.push('/report')` 失败时保留完成状态、成功审计和跳转失败 alert。
- 已完成：`ChatPanel.vue` OTD/POC 复盘 CSV 已触发下载但下载链接清理失败时 fail loud，避免已完成导出动作被误报为失败。
- 已完成：新增目标测试覆盖 CSV 导出后 `URL.revokeObjectURL()` 失败时保留完成状态、成功审计和清理失败 alert。
- 已完成：`ChatPanel.vue` 启动上下文同步失败时 fail loud，避免 mounted hook unhandled error 掩盖助手上下文缺失。
- 已完成：新增目标测试覆盖 `readAnomalyDispatchRecordsBackendFirst()` 失败时显示 assertive alert，并保留聊天入口可用。
- 已完成：`ChatPanel.vue` OTD/POC 复盘 CSV 下载准备失败时 fail loud，避免 Blob 创建失败只显示泛化动作失败文案。
- 已完成：新增目标测试覆盖 `URL.createObjectURL()` 失败时不显示完成状态、不跳转报表中心，并显示专用 assertive alert。
- 已完成：`ChatPanel.vue` OTD/POC 复盘 CSV 下载点击失败时释放已创建 object URL，避免导出未完成路径泄漏 Blob URL。
- 已完成：新增目标测试覆盖 `HTMLAnchorElement.click()` 失败时调用 `URL.revokeObjectURL()`、保留失败审计、不显示完成状态。
- 已完成：`ChatPanel.vue` 聊天历史加载失败时 fail loud，避免重新打开助手时把接口失败静默显示为空历史。
- 已完成：新增目标测试覆盖 `getChatHistory()` 失败时显示 assertive alert，并保留聊天入口可用。
- 已完成：`ChatPanel.vue` LLM 状态加载失败时 fail loud，避免模型状态接口失败被静默隐藏成无徽标。
- 已完成：新增目标测试覆盖 `getLlmStatus()` 失败时显示 assertive alert，并保留聊天入口可用。
- 已完成：`ChatPanel.vue` 启动上下文同步改为来源级 fail loud，避免异常调度来源失败短路现场态势和风险 SLA 来源。
- 已完成：新增目标测试覆盖单个启动上下文来源失败时其它来源仍继续读取。

## Continue

- 继续：按“覆盖率最低且用户必经/高风险”原则选择后续切片；`ChatPanel.vue` 当前行覆盖率为 `61.2%`。
- 继续：下一片建议重新比较 `RoutingBoard.vue`、`AuditDecisionReplayPanel.vue`，或继续审计 AI 助手更高风险业务路径。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 已确认：`gh` 登录和 Docker 可用；仍缺 GitHub repo/remote 绑定，当前 `origin` 指向腾讯工蜂。
