# 2026-06-05 EmployeeBoard Fail-loud Issues

## Fixed

- 问题：`EmployeeBoard.vue` 的员工创建 API 失败时会追加本地假员工，并关闭创建弹窗。
- 风险：用户可能误以为人员档案已创建，后续排班、技能矩阵、质量追溯和权限相关流程会引用一个未持久化员工。
- 处理：`handleCreate()` 捕获 `createEmployee()` 错误后显示 assertive alert，保留创建弹窗和表单输入，不再写入本地列表。
- 验证：目标 unit `1 file / 8 tests passed`，全量前端 unit coverage `81 files / 429 tests passed`，lint 通过。

- 问题：`EmployeeBoard.vue` 的员工创建 API 成功后，页面只关闭弹窗，不展示后端返回的新员工。
- 风险：用户可能误以为创建未生效，重复提交或依赖刷新确认，降低人员主数据录入可靠性。
- 处理：`handleCreate()` 使用 `createEmployee()` 返回的 `Employee` 更新当前列表，再关闭弹窗和重置表单。
- 验证：目标 unit `1 file / 8 tests passed`，全量前端 unit coverage `81 files / 429 tests passed`，lint 通过。

- 问题：`EmployeeBoard.vue` 的员工列表初始加载失败时会静默展示本地 demo 员工。
- 风险：用户可能误以为示例员工是真实人员档案，继续进行排班、技能矩阵或人员资料操作。
- 处理：`onMounted()` 捕获 `getEmployeeList()` 错误后显示 assertive alert，明确“员工列表加载失败，当前展示本地示例数据”，保留 demo fallback 但不再静默。
- 验证：目标 unit `1 file / 8 tests passed`，全量前端 unit coverage `81 files / 429 tests passed`，lint 通过。

- 问题：`EmployeeBoard.vue` 的员工编辑保存 API 成功后，页面只关闭弹窗，不展示后端返回的更新后员工。
- 风险：用户可能误以为保存未生效，或继续基于旧人员资料进行排班/联系/技能矩阵判断。
- 处理：`handleUpdate()` 使用 `updateEmployee()` 返回的 `Employee` 替换当前列表同 id 员工，再关闭弹窗。
- 验证：目标 unit `1 file / 8 tests passed`，全量前端 unit coverage `81 files / 429 tests passed`，lint 通过。

- 问题：`EmployeeBoard.vue` 的员工编辑保存 API 失败时会把表单内容合并进本地员工对象，并关闭编辑弹窗。
- 风险：用户可能误以为人员资料已保存，后续排班、技能矩阵、联系信息和审计口径会继续引用未持久化变更。
- 处理：`handleUpdate()` 捕获 `updateEmployee()` 错误后显示 assertive alert，保留编辑弹窗和表单输入，不再改写本地员工对象。
- 验证：目标 unit `1 file / 8 tests passed`，全量前端 unit coverage `81 files / 429 tests passed`，lint 通过。

- 问题：`EmployeeBoard.vue` 的员工离职 API 失败时会把本地员工标记为离职，并关闭编辑弹窗。
- 风险：用户可能误以为员工已离职，但真实人员档案仍在职，排班、权限和生产执行人员选择会出现前后端状态不一致。
- 处理：`handleDeactivate()` 捕获 `deactivateEmployee()` 错误后显示 assertive alert，保留编辑弹窗，不再本地标记离职。
- 验证：目标 unit `1 file / 8 tests passed`，全量前端 unit coverage `81 files / 429 tests passed`，lint 通过。

- 问题：`EmployeeBoard.vue` 的员工离职 API 成功后，默认在职列表仍展示该员工。
- 风险：用户可能误以为离职未生效，或继续把已离职员工用于排班、权限和生产执行人员选择。
- 处理：`handleDeactivate()` 成功后将当前员工 `isActive` 标记为 `false`，让既有在职过滤逻辑从默认列表移除该员工。
- 验证：目标 unit `1 file / 8 tests passed`，全量前端 unit coverage `81 files / 429 tests passed`，lint 通过。

- 问题：员工卡片原先只有鼠标点击入口。
- 风险：键盘用户无法稳定进入员工详情/编辑弹窗，人员管理主路径不够精品。
- 处理：员工卡片新增 button 语义、键盘焦点、aria-label，并支持 Enter/Space 打开详情。
- 验证：目标 unit 覆盖卡片语义和键盘打开详情路径。

## Remaining

- `EmployeeBoard.vue` 行覆盖率当前为 `75.2%`，已进入和 `PurchaseBoard.vue` 接近的覆盖区间；继续深挖边际收益开始下降。
- 人员列表初始加载失败已明确提示 demo fallback；发布路径如需完全禁用 demo 数据，还需要单独环境开关策略。
- 后续更适合按覆盖率杠杆转向其它更低覆盖且用户必经组件，而不是继续精修 `EmployeeBoard.vue`。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
