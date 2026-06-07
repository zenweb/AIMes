# 2026-06-05 EmployeeBoard Fail-loud Plan

## Success Criteria

- 员工创建 API 失败时不允许产生本地假员工。
- 员工创建 API 失败时必须保留创建弹窗和用户输入，便于重试。
- 员工创建 API 失败时必须用 `[role="alert"]` 明确提示失败原因。
- 员工创建 API 成功时必须展示后端返回的真实员工档案。
- 员工列表初始加载失败时，如保留 demo fallback，必须用 `[role="alert"]` 明确提示当前展示的是本地示例数据。
- 员工编辑保存 API 失败时不允许改写本地员工对象。
- 员工编辑保存 API 失败时必须保留编辑弹窗和用户输入，便于重试。
- 员工编辑保存 API 失败时必须用 `[role="alert"]` 明确提示失败原因。
- 员工编辑保存 API 成功时必须展示后端返回的真实员工资料。
- 员工离职 API 失败时不允许本地标记离职。
- 员工离职 API 失败时必须保留编辑弹窗，便于用户确认状态和重试。
- 员工离职 API 失败时必须用 `[role="alert"]` 明确提示失败原因。
- 员工离职 API 成功时默认在职列表必须移除该员工。
- 人员卡片主入口必须支持键盘进入详情。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：按覆盖率杠杆从 `PurchaseBoard.vue` 转向更低覆盖且用户必经的 `EmployeeBoard.vue`。
- 已完成：新增红灯测试覆盖 `createEmployee()` 抛错时创建弹窗必须保持打开、页面不能出现本地假员工、alert 必须显示底层错误。
- 已完成：修复 `handleCreate()` 的本地假成功逻辑，失败时 fail loud 并保留表单上下文。
- 已完成：新增红灯测试覆盖 `createEmployee()` 成功返回员工后，列表必须展示后端返回的员工。
- 已完成：修复 `handleCreate()` 的成功路径，使用后端返回的 `Employee` 更新当前列表。
- 已完成：新增红灯测试覆盖 `getEmployeeList()` 抛错时 demo fallback 必须显示“员工列表加载失败，当前展示本地示例数据”。
- 已完成：修复 `onMounted()` 的静默 demo fallback，保留示例数据但 fail loud。
- 已完成：新增红灯测试覆盖 `updateEmployee()` 抛错时编辑弹窗必须保持打开、页面不能出现未持久化姓名、alert 必须显示底层错误。
- 已完成：修复 `handleUpdate()` 的本地假成功逻辑，失败时 fail loud 并保留表单上下文。
- 已完成：新增红灯测试覆盖 `updateEmployee()` 成功返回员工后，列表必须展示后端返回的员工资料。
- 已完成：修复 `handleUpdate()` 的成功路径，使用后端返回的 `Employee` 替换当前列表员工。
- 已完成：新增红灯测试覆盖 `deactivateEmployee()` 抛错时编辑弹窗必须保持打开、员工仍保留在职列表、alert 必须显示底层错误。
- 已完成：修复 `handleDeactivate()` 的本地假成功逻辑，失败时 fail loud 并保留编辑上下文。
- 已完成：新增红灯测试覆盖 `deactivateEmployee()` 成功后默认在职列表必须移除该员工。
- 已完成：修复 `handleDeactivate()` 的成功路径，成功后将当前员工标记为离职并交由既有过滤逻辑隐藏。
- 已完成：新增员工卡片键盘访问测试，覆盖 button 语义、焦点和 Enter 打开详情。
- 已验证：目标 unit `1 file / 8 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 429 tests passed`；总行覆盖率 `75.13%`，`EmployeeBoard.vue` 行覆盖率 `75.2%`。
- 已验证：`npm run lint` 通过。
- 下一步：`EmployeeBoard.vue` 已到 `75.2%` 行覆盖率；按覆盖率杠杆转向其它更低覆盖且用户必经组件。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
