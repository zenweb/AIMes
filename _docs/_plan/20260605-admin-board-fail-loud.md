# 2026-06-05 AdminBoard Fail-loud Plan

## Success Criteria

- 系统用户创建 API 失败时不允许产生本地假用户。
- 系统用户创建 API 失败时必须保留创建弹窗和用户输入，便于重试。
- 系统用户创建 API 失败时必须用 `[role="alert"]` 明确提示失败原因。
- 系统用户编辑 API 失败时不允许本地覆盖用户资料。
- 系统用户编辑 API 失败时必须保留编辑弹窗和用户输入，便于重试。
- 系统用户编辑 API 失败时必须用 `[role="alert"]` 明确提示失败原因。
- 系统用户启停 API 失败时不允许本地翻转启停状态。
- 系统用户启停 API 失败时必须用 `[role="alert"]` 明确提示失败原因。
- 系统配置保存 API 失败时必须用 `[role="alert"]` 明确提示失败原因。
- 系统配置保存 API 失败时必须保留用户输入，便于重试。
- 通知配置保存 API 失败时不允许本地切换通知开关。
- 通知配置保存 API 失败时必须用 `[role="alert"]` 明确提示失败原因。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：按覆盖率杠杆从 `EmployeeBoard.vue` 转向更低覆盖且高风险的 `AdminBoard.vue`。
- 已完成：新增红灯测试覆盖 `createUser()` 抛错时创建弹窗必须保持打开、页面不能出现本地假用户、alert 必须显示底层错误。
- 已完成：修复 `handleUserCreate()` 的本地假成功逻辑，失败时 fail loud 并保留表单上下文。
- 已完成：新增红灯测试覆盖 `updateUser()` 抛错时编辑弹窗必须保持打开、页面不能本地覆盖用户资料、alert 必须显示底层错误。
- 已完成：修复 `handleUserUpdate()` 的本地假成功逻辑，失败时 fail loud 并保留表单上下文。
- 已完成：新增红灯测试覆盖 `updateUser()` 抛错时状态列不得从“启用”本地翻成“禁用”、alert 必须显示底层错误。
- 已完成：修复 `toggleUserActive()` 的本地假成功逻辑，失败时 fail loud 且不翻转状态。
- 已完成：新增红灯测试覆盖 `updateConfig()` 抛错时保留配置输入、alert 必须显示底层错误。
- 已完成：修复 `handleConfigSave()` 的静默吞错逻辑，失败时 fail loud 并保留输入。
- 已完成：新增红灯测试覆盖 `updateNotificationConfig()` 抛错时重新进入通知页不得本地切换开关、alert 必须显示底层错误。
- 已完成：修复 `handleNotifToggle()` 的静默吞错和本地假切换逻辑，失败时 fail loud 且不翻转开关。
- 已验证：目标 unit `1 file / 6 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 434 tests passed`；总行覆盖率 `75.41%`，`AdminBoard.vue` 行覆盖率 `73.67%`。
- 已验证：`npm run lint` 通过。
- 下一步：按覆盖率杠杆重新排序，优先继续审计低覆盖且用户必经/高风险的管理动作。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
