# 2026-06-05 AdminBoard Fail-loud Changelog

## User Create Write Fail-loud Slice

- 选片依据：`EmployeeBoard.vue` 已到 `75.2%` 行覆盖率，按覆盖率杠杆转向更低覆盖且高风险的 `AdminBoard.vue`；系统用户创建是账号、角色和权限管理入口。
- 问题：`createUser()` 抛错时，`handleUserCreate()` 会在本地 `users` 列表 push 一个 `id: 'new'` 的假用户，并关闭创建弹窗。
- 风险：管理员可能看到账号已创建，但真实系统账号未写入后端，后续权限分配、登录、审计追踪会引用不存在的用户。
- 修复：新增页面级 assertive alert；创建失败时提示“用户创建失败，未写入系统账号：...”，保留创建弹窗和表单，不再追加本地假用户。
- 行为保持：创建成功路径仍关闭弹窗并重置创建表单；本片不扩展成功后的列表刷新策略。
- 测试：新增 TDD 用例 `keeps create dialog open and does not add a local user when create api fails`，先红于失败后弹窗被关闭，再最小修复。
- 验证：`npm run test:unit -- tests/unit/admin-board.test.ts` 通过，`1 file / 2 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 430 tests passed`，总行覆盖率 `75.16%`，`AdminBoard.vue` 行覆盖率 `69.45%`。
- 验证：`npm run lint` 通过。

## User Update Write Fail-loud Slice

- 问题：`updateUser()` 抛错时，`handleUserUpdate()` 会把编辑表单直接合并到本地用户对象，并关闭编辑弹窗。
- 风险：管理员可能看到用户资料、角色已保存，但真实系统账号未写入后端，后续权限和审计状态会和后端事实不一致。
- 修复：编辑失败时提示“用户资料保存失败，未写入系统账号：...”，保留编辑弹窗和表单，不再本地覆盖用户资料。
- 行为保持：编辑成功路径仍清空失败提示并关闭编辑弹窗；本片不扩展成功后的列表刷新策略。
- 测试：新增 TDD 用例 `keeps edit dialog open and does not locally update a user when update api fails`，先红于失败后弹窗被关闭，再最小修复。
- 验证：`npm run test:unit -- tests/unit/admin-board.test.ts` 通过，`1 file / 3 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 431 tests passed`，总行覆盖率 `75.22%`，`AdminBoard.vue` 行覆盖率 `70.5%`。
- 验证：`npm run lint` 通过。

## User Active Status Write Fail-loud Slice

- 问题：`updateUser()` 抛错时，`toggleUserActive()` 会在本地翻转 `u.isActive`。
- 风险：管理员可能看到用户已禁用或启用，但真实系统账号状态未写入后端，后续登录权限和审计状态会和页面显示不一致。
- 修复：启停失败时提示“用户启停失败，未写入系统账号：...”，不再本地翻转启停状态。
- 行为保持：启停成功路径仍不本地扩展列表刷新策略；本片只关闭失败假成功。
- 测试：新增 TDD 用例 `does not locally toggle a user when active status update api fails`，先红于状态列从“启用”被本地翻成“禁用”，再最小修复。
- 验证：`npm run test:unit -- tests/unit/admin-board.test.ts` 通过，`1 file / 4 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 432 tests passed`，总行覆盖率 `75.25%`，`AdminBoard.vue` 行覆盖率 `70.97%`。
- 验证：`npm run lint` 通过。

## System Config Save Fail-loud Slice

- 问题：`updateConfig()` 抛错时，`handleConfigSave()` 会静默吞掉错误。
- 风险：管理员可能以为安全、生产或 AI 系统配置已保存，但真实配置未写入后端，后续运行策略会和页面输入不一致。
- 修复：配置保存失败时提示“系统配置保存失败，未写入系统配置：...”，保留当前输入值便于重试。
- 行为保持：保存成功路径仍清空失败提示；本片不扩展成功后的配置列表刷新策略。
- 测试：新增 TDD 用例 `shows a retryable alert when system config save api fails`，先红于页面没有 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/admin-board.test.ts` 通过，`1 file / 5 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 433 tests passed`，总行覆盖率 `75.35%`，`AdminBoard.vue` 行覆盖率 `72.61%`。
- 验证：`npm run lint` 通过。

## Notification Config Toggle Fail-loud Slice

- 问题：`updateNotificationConfig()` 抛错时，`handleNotifToggle()` 会静默吞掉错误，并继续本地切换通知开关。
- 风险：管理员可能以为生产异常等通知已关闭或开启，但真实通知配置未写入后端，后续告警策略会和页面显示不一致。
- 修复：通知配置保存失败时提示“通知配置保存失败，未写入系统配置：...”，不再本地切换开关。
- 行为保持：通知配置保存成功后仍本地切换开关并清空失败提示；本片不扩展成功后的配置列表刷新策略。
- 测试：新增 TDD 用例 `does not locally toggle notification config when save api fails`，先红于失败后重新进入通知页开关变为关闭，再最小修复。
- 验证：`npm run test:unit -- tests/unit/admin-board.test.ts` 通过，`1 file / 6 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 434 tests passed`，总行覆盖率 `75.41%`，`AdminBoard.vue` 行覆盖率 `73.67%`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 前端账号管理可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
