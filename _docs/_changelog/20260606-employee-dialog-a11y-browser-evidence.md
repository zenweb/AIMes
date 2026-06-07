# 2026-06-06 EmployeeBoard 员工弹窗语义真实浏览器证据

## Changed

- 为 `EmployeeBoard` 的编辑/详情弹窗补充 `role="dialog"`、`aria-modal="true"` 和标题 `aria-labelledby`。
- 为新增员工弹窗补充同样的 modal dialog 语义。
- 为关闭/取消按钮补充场景化可访问名称：`关闭员工编辑`、`关闭员工详情`、`取消新增员工`。
- 新增真实 Chromium 用例，通过员工卡片的可访问按钮名称聚焦并按 Enter 打开 `编辑员工` 对话框。
- 修复员工页滚动布局，避免技能矩阵区域把员工卡片挤出可点击视口后拦截鼠标点击。
- 编辑/详情弹窗打开后会聚焦到 dialog，按 Escape 关闭后焦点回到原员工卡片。
- 新增员工弹窗打开后会聚焦到 `新增员工` dialog，按 Escape 关闭后焦点回到 `+ 新增` 按钮。

## Tests

- RED：`npm.cmd run test:unit -- tests/unit/employee-board.test.ts -t "labels employee edit and create dialogs"`：预期失败，原弹窗缺少 `[role="dialog"]`。
- GREEN：`npm.cmd run test:unit -- tests/unit/employee-board.test.ts -t "labels employee edit and create dialogs"`：1 file passed，1/9 passed，8 skipped。
- `npm.cmd run test:unit -- tests/unit/employee-board.test.ts`：1 file passed，9/9 passed。
- RED：`npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "鼠标点击员工卡片打开可命名编辑对话框"`：预期失败，技能矩阵区域/员工页容器拦截员工卡片点击。
- GREEN：`npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "鼠标点击员工卡片打开可命名编辑对话框"`：Nuxt production build passed，Chromium 1/1 passed。
- RED：`npm.cmd run test:unit -- tests/unit/employee-board.test.ts -t "returns focus to the employee card"`：预期失败，Escape 后 dialog 未关闭。
- GREEN：`npm.cmd run test:unit -- tests/unit/employee-board.test.ts -t "returns focus to the employee card"`：1 file passed，1/10 passed，9 skipped。
- GREEN：`npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "员工卡片打开可命名编辑对话框"`：Nuxt production build passed，Chromium 2/2 passed，覆盖键盘 Escape/回焦与鼠标点击路径。
- `npm.cmd run test:unit -- tests/unit/employee-board.test.ts`：1 file passed，10/10 passed。
- `npm.cmd run lint`：ESLint passed。
- RED：`npm.cmd run test:unit -- tests/unit/employee-board.test.ts -t "returns focus to the add button"`：预期失败，创建弹窗打开后焦点仍停在 `+ 新增`。
- GREEN：`npm.cmd run test:unit -- tests/unit/employee-board.test.ts -t "returns focus to the add button"`：1 file passed，1/11 passed，10 skipped。
- `npm.cmd run test:unit -- tests/unit/employee-board.test.ts`：1 file passed，11/11 passed。
- `npm.cmd run lint`：ESLint passed。
- GREEN：`npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "新增员工弹窗支持 Escape 关闭并回到新增按钮"`：Nuxt production build passed，Chromium 1/1 passed。

## Notes

- 本片只硬化既有人员管理关键路径，不新增员工业务功能。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察。
