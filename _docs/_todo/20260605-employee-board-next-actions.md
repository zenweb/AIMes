# 2026-06-05 EmployeeBoard Next Actions

## Done

- 已完成：`EmployeeBoard.vue` 员工创建 API 失败时 fail loud，避免未持久化员工被本地假成功展示。
- 已完成：新增目标测试覆盖 `createEmployee()` 抛错时保留创建弹窗、不追加 `EMP-900`、显示失败 alert。
- 已完成：`EmployeeBoard.vue` 员工创建 API 成功后展示后端返回员工，避免用户看不到新建人员档案。
- 已完成：新增目标测试覆盖 `createEmployee()` 成功返回 `EMP-900` 后列表展示新员工。
- 已完成：`EmployeeBoard.vue` 员工列表加载失败时 fail loud，避免本地 demo fallback 被误认为真实人员数据。
- 已完成：新增目标测试覆盖 `getEmployeeList()` 抛错时展示 demo 员工且显示“员工列表加载失败，当前展示本地示例数据”。
- 已完成：`EmployeeBoard.vue` 员工编辑保存 API 失败时 fail loud，避免未持久化资料被本地假成功展示。
- 已完成：新增目标测试覆盖 `updateEmployee()` 抛错时保留编辑弹窗、不展示未持久化姓名、显示失败 alert。
- 已完成：`EmployeeBoard.vue` 员工编辑保存 API 成功后展示后端返回资料，避免保存成功后卡片仍显示旧资料。
- 已完成：新增目标测试覆盖 `updateEmployee()` 成功返回“王小明”后列表展示更新后员工。
- 已完成：`EmployeeBoard.vue` 员工离职 API 失败时 fail loud，避免未持久化离职状态被本地假成功展示。
- 已完成：新增目标测试覆盖 `deactivateEmployee()` 抛错时保留编辑弹窗、员工仍在职、显示失败 alert。
- 已完成：`EmployeeBoard.vue` 员工离职 API 成功后默认在职列表移除该员工，避免离职成功后仍显示在职。
- 已完成：新增目标测试覆盖 `deactivateEmployee()` 成功后默认在职列表从 2 张员工卡变为 1 张。
- 已完成：员工卡片新增 button 语义、键盘焦点、aria-label 和 Enter/Space 打开详情能力。
- 已完成：新增目标测试覆盖键盘用户从员工卡片打开员工详情。

## Continue

- 继续：按“覆盖率最低且用户必经”原则选择后续切片；`EmployeeBoard.vue` 当前行覆盖率为 `75.2%`，继续精修边际收益下降。
- 继续：优先转向其它更低覆盖的用户必经组件，而不是继续榨 `EmployeeBoard.vue`。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- `gh auth` 已成功登录为 `zenweb`，但当前 remote 仍指向腾讯工蜂，GitHub 仓库解析/Actions 证据不能凭空关闭。
