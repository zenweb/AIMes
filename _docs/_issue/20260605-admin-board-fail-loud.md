# 2026-06-05 AdminBoard Fail-loud Issues

## Fixed

- 问题：`AdminBoard.vue` 的系统用户创建 API 失败时会追加本地假用户，并关闭创建弹窗。
- 风险：管理员可能误以为账号已创建，后续权限、登录和审计流程会引用一个未持久化系统用户。
- 处理：`handleUserCreate()` 捕获 `createUser()` 错误后显示 assertive alert，保留创建弹窗和表单输入，不再写入本地列表。
- 问题：`AdminBoard.vue` 的系统用户编辑 API 失败时会本地覆盖用户资料，并关闭编辑弹窗。
- 风险：管理员可能误以为用户资料或角色已保存，后续权限和审计流程会和后端真实状态不一致。
- 处理：`handleUserUpdate()` 捕获 `updateUser()` 错误后显示 assertive alert，保留编辑弹窗和表单输入，不再改写本地用户对象。
- 问题：`AdminBoard.vue` 的系统用户启停 API 失败时会本地翻转启停状态。
- 风险：管理员可能误以为账号已禁用或启用，后续登录权限和审计流程会和后端真实状态不一致。
- 处理：`toggleUserActive()` 捕获 `updateUser()` 错误后显示 assertive alert，不再翻转本地用户启停状态。
- 问题：`AdminBoard.vue` 的系统配置保存 API 失败时会静默吞掉错误。
- 风险：管理员可能误以为配置已保存，后续安全、生产或 AI 配置策略会和后端真实状态不一致。
- 处理：`handleConfigSave()` 捕获 `updateConfig()` 错误后显示 assertive alert，保留当前输入值便于重试。
- 问题：`AdminBoard.vue` 的通知配置保存 API 失败时会静默吞掉错误，并本地切换通知开关。
- 风险：管理员可能误以为通知策略已开启或关闭，后续实时告警行为会和页面显示不一致。
- 处理：`handleNotifToggle()` 捕获 `updateNotificationConfig()` 错误后显示 assertive alert，不再本地切换通知开关。
- 验证：目标 unit `1 file / 6 tests passed`，全量前端 unit coverage `81 files / 434 tests passed`，lint 通过。

## Remaining

- `AdminBoard.vue` 行覆盖率当前为 `73.67%`，仍略低于 `EmployeeBoard.vue`、`PurchaseBoard.vue` 和 `BomBoard.vue`，且账号/权限/配置管理属于高风险管理入口，后续可继续审计其他管理动作。
- 本片未关闭 Hosted CI、staging、攻击链、安全签字、灰度和 14 天观察等 B-track 发布门。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
