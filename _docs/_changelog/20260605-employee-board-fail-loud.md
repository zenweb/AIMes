# 2026-06-05 EmployeeBoard Fail-loud Changelog

## Employee Create Write Fail-loud Slice

- 选片依据：按覆盖率杠杆从已到 `75.81%` 行覆盖的 `PurchaseBoard.vue` 转向更低覆盖且用户必经的 `EmployeeBoard.vue`；人员档案创建是权限、排班、技能矩阵和生产执行的基础资料入口。
- 问题：`createEmployee()` 抛错时，`handleCreate()` 会在本地 `employees` 列表 push 一个 `id: 'new'` 的假员工，并关闭创建弹窗。
- 风险：用户可能看到员工已创建，但真实人员档案未写入后端，后续技能矩阵、排班和审计链会基于不存在的人员数据继续操作。
- 修复：创建失败时显示 assertive alert：“员工创建失败，未写入人员档案：...”，保留创建弹窗和用户已输入表单，不再追加本地假员工。
- 行为保持：创建失败路径不再伪造本地员工；创建成功可见性由后续切片单独覆盖。
- 测试：新增 TDD 用例 `keeps create dialog open and does not add a local employee when create api fails`，先红于失败后弹窗被关闭，再最小修复。
- 验证：`npm run test:unit -- tests/unit/employee-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 429 tests passed`，总行覆盖率 `75.13%`，`EmployeeBoard.vue` 行覆盖率 `75.2%`。
- 验证：`npm run lint` 通过。

## Employee Create Success Visibility Slice

- 选片依据：继续 `EmployeeBoard.vue` 的人员创建主路径；创建成功后用户必须能看到后端真实返回的人员档案，而不是只能等待刷新。
- 问题：`createEmployee()` 成功返回后，`handleCreate()` 只关闭弹窗并重置表单，没有把后端返回的新员工反映到人员列表。
- 风险：用户可能误以为创建没有生效，重复提交或切换页面刷新，影响人员主数据录入效率和信任感。
- 修复：创建成功后把 `createEmployee()` 返回的 `Employee` 放入当前列表，再关闭弹窗和重置表单。
- 行为保持：创建失败 fail-loud 路径不变；本片不扩展后台刷新策略，也不伪造本地员工。
- 测试：新增 TDD 用例 `adds the backend-created employee to the visible list after create succeeds`，先红于列表不包含 `EMP-900`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/employee-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 429 tests passed`，总行覆盖率 `75.13%`，`EmployeeBoard.vue` 行覆盖率 `75.2%`。
- 验证：`npm run lint` 通过。

## Employee List Load Demo Fallback Fail-loud Slice

- 选片依据：继续 `EmployeeBoard.vue` 的人员主数据入口；初始列表加载是人员管理的首屏基础路径。
- 问题：`getEmployeeList()` 抛错时，`onMounted()` 会静默灌入本地 demo 员工，没有告诉用户真实后端人员列表加载失败。
- 风险：用户可能把示例员工误认为真实人员档案，继续进行排班、技能矩阵或人员资料操作。
- 修复：列表加载失败时显示 assertive alert：“员工列表加载失败，当前展示本地示例数据：...”，保留 demo fallback 以支持离线演示，但不再静默。
- 行为保持：列表加载成功路径不变；本片不改变 demo 员工数据、不引入环境开关。
- 测试：新增 TDD 用例 `announces when employee list loading falls back to demo data`，先红于找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/employee-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 429 tests passed`，总行覆盖率 `75.13%`，`EmployeeBoard.vue` 行覆盖率 `75.2%`。
- 验证：`npm run lint` 通过。

## Employee Update Write Fail-loud Slice

- 选片依据：继续 `EmployeeBoard.vue` 的人员档案写入链路；编辑员工资料和创建员工同属人员主数据关键路径。
- 问题：`updateEmployee()` 抛错时，`handleUpdate()` 会 `Object.assign(editTarget.value, editForm.value)`，把未持久化的编辑内容写进本地员工卡片并关闭弹窗。
- 风险：用户可能看到员工资料已保存，但真实人员档案没有写入后端，排班、技能矩阵、联系信息和审计口径会出现页面假数据。
- 修复：编辑保存失败时显示 assertive alert：“员工资料保存失败，未写入人员档案：...”，保留编辑弹窗和表单，不再改写本地员工对象。
- 行为保持：编辑保存成功路径仍关闭弹窗；本片不扩展成功后的列表刷新策略。
- 测试：新增 TDD 用例 `keeps edit dialog open and does not locally update employee details when update api fails`，先红于失败后弹窗被关闭，再最小修复。
- 验证：`npm run test:unit -- tests/unit/employee-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 429 tests passed`，总行覆盖率 `75.13%`，`EmployeeBoard.vue` 行覆盖率 `75.2%`。
- 验证：`npm run lint` 通过。

## Employee Update Success Visibility Slice

- 选片依据：继续 `EmployeeBoard.vue` 的人员资料编辑主路径；保存成功后用户必须能看到后端确认后的真实人员档案。
- 问题：`updateEmployee()` 成功返回后，`handleUpdate()` 只关闭弹窗，没有把后端返回的员工资料反映到人员卡片。
- 风险：用户可能误以为保存未生效，或继续基于旧姓名/电话/班组判断人员状态。
- 修复：编辑保存成功后使用 `updateEmployee()` 返回的 `Employee` 替换当前列表中同 id 员工，再关闭弹窗。
- 行为保持：编辑保存失败 fail-loud 路径不变；本片不伪造本地保存结果。
- 测试：新增 TDD 用例 `updates the visible employee card with the backend-updated employee after save succeeds`，先红于列表不包含“王小明”，再最小修复。
- 验证：`npm run test:unit -- tests/unit/employee-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 429 tests passed`，总行覆盖率 `75.13%`，`EmployeeBoard.vue` 行覆盖率 `75.2%`。
- 验证：`npm run lint` 通过。

## Employee Deactivate Write Fail-loud Slice

- 选片依据：继续 `EmployeeBoard.vue` 的人员档案写入链路；员工离职会影响排班可用性、权限口径和生产执行人员选择。
- 问题：`deactivateEmployee()` 抛错时，`handleDeactivate()` 会把 `editTarget.value.isActive = false`，把未持久化的离职结果写进本地员工卡片并关闭弹窗。
- 风险：用户可能看到员工已离职，但真实人员档案仍在职，排班和权限侧会出现页面状态与后端状态不一致。
- 修复：离职失败时显示 assertive alert：“员工离职失败，人员档案仍保持在职：...”，保留编辑弹窗，不再本地标记离职。
- 行为保持：离职成功路径仍关闭弹窗；本片不扩展成功后的列表刷新策略。
- 测试：新增 TDD 用例 `keeps edit dialog open and does not locally deactivate employee when deactivate api fails`，先红于失败后弹窗被关闭，再最小修复。
- 验证：`npm run test:unit -- tests/unit/employee-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 429 tests passed`，总行覆盖率 `75.13%`，`EmployeeBoard.vue` 行覆盖率 `75.2%`。
- 验证：`npm run lint` 通过。

## Employee Deactivate Success Visibility Slice

- 选片依据：继续 `EmployeeBoard.vue` 的人员离职主路径；离职成功后默认在职列表必须反映后端确认动作。
- 问题：`deactivateEmployee()` 成功返回后，`handleDeactivate()` 只关闭弹窗，没有把员工从默认在职列表移除。
- 风险：用户可能误以为离职未生效，或继续把已离职员工用于排班、权限和生产执行人员选择。
- 修复：离职成功后把当前员工 `isActive` 标记为 `false`，利用既有 `showInactive` 过滤逻辑从默认在职列表移除。
- 行为保持：离职失败 fail-loud 路径不变；本片不扩展后端刷新策略。
- 测试：新增 TDD 用例 `removes the employee from the default active list after deactivate succeeds`，先红于默认列表仍有 2 张员工卡，再最小修复。
- 验证：`npm run test:unit -- tests/unit/employee-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 429 tests passed`，总行覆盖率 `75.13%`，`EmployeeBoard.vue` 行覆盖率 `75.2%`。
- 验证：`npm run lint` 通过。

## Employee Card Keyboard Access Slice

- 选片依据：人员列表卡片是进入员工详情/编辑的主入口；原先只有鼠标点击路径，对键盘用户不够精品。
- 修复：员工卡片新增 `role="button"`、`tabindex="0"`、可读 `aria-label`，并支持 Enter/Space 打开员工详情。
- 测试：新增目标用例 `lets keyboard users open employee details from employee cards`，覆盖卡片语义属性和键盘打开编辑弹窗。

## Release Boundary

- 本片仍属于 A-track 前端质量和可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
