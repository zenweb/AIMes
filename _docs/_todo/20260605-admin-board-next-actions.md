# 2026-06-05 AdminBoard Next Actions

## Done

- 已完成：`AdminBoard.vue` 系统用户创建 API 失败时 fail loud，避免未持久化账号被本地假成功展示。
- 已完成：新增目标测试覆盖 `createUser()` 抛错时保留创建弹窗、不追加 `qa-admin`、显示失败 alert。
- 已完成：`AdminBoard.vue` 系统用户编辑 API 失败时 fail loud，避免未持久化的用户资料或角色被本地假成功展示。
- 已完成：新增目标测试覆盖 `updateUser()` 抛错时保留编辑弹窗、不本地改写 `operator1`、显示失败 alert。
- 已完成：`AdminBoard.vue` 系统用户启停 API 失败时 fail loud，避免未持久化的启停状态被本地假成功展示。
- 已完成：新增目标测试覆盖 `updateUser()` 抛错时状态列保持“启用”、操作按钮保持“禁用”、显示失败 alert。
- 已完成：`AdminBoard.vue` 系统配置保存 API 失败时 fail loud，避免静默吞错导致配置保存误判。
- 已完成：新增目标测试覆盖 `updateConfig()` 抛错时保留配置输入、显示失败 alert。
- 已完成：`AdminBoard.vue` 通知配置保存 API 失败时 fail loud，避免静默吞错和本地假切换。
- 已完成：新增目标测试覆盖 `updateNotificationConfig()` 抛错后重新进入通知页开关保持原状态、显示失败 alert。

## Continue

- 继续：按“覆盖率最低且用户必经/高风险”原则选择后续切片；`AdminBoard.vue` 当前行覆盖率为 `73.67%`，已完成主要写入失败 fail-loud 路径，可重新和其他低覆盖组件比较边际收益。
- 继续：若仍留在 `AdminBoard.vue`，优先审计成功后刷新策略、并发重试和后端一致性边界，而不是新增功能。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
