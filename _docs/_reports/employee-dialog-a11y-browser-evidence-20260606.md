# EmployeeBoard Dialog A11y Browser Evidence - 2026-06-06

## Scope

- A 轨：人员管理既有员工编辑/新增弹窗可访问语义。
- B 轨：仅记录未完成，不在本片消除。

## Evidence

- RED unit：缺少 `[role="dialog"]` 时 `labels employee edit and create dialogs` 失败。
- GREEN unit：`tests/unit/employee-board.test.ts` 9/9 passed。
- RED Chromium e2e：`鼠标点击员工卡片打开可命名编辑对话框` 失败，日志显示 `.skill-matrix-panel` / `.emp-board` 拦截指针事件。
- GREEN Chromium e2e：`鼠标点击员工卡片打开可命名编辑对话框` 完整 Nuxt build 后 1/1 passed。
- RED unit：`returns focus to the employee card` 失败，Escape 后 dialog 未关闭。
- GREEN unit：`tests/unit/employee-board.test.ts` 10/10 passed。
- GREEN Chromium e2e：`员工卡片打开可命名编辑对话框` 2/2 passed，覆盖键盘打开、Escape 关闭、关闭回焦与鼠标点击路径。
- Lint：`npm.cmd run lint` passed。
- RED unit：`returns focus to the add button` 失败，创建弹窗打开后焦点仍停在触发按钮。
- GREEN unit：`tests/unit/employee-board.test.ts` 11/11 passed。
- GREEN Chromium e2e：`新增员工弹窗支持 Escape 关闭并回到新增按钮` 完整 Nuxt production build 后 Chromium 1/1 passed。
- Lint：`npm.cmd run lint` passed。

## Browser Finding

- Playwright 截图和 DOM 测量显示员工卡片被推到视口外，员工列表高度为 0。
- 修复后员工页使用页面级滚动，鼠标点击员工卡片可打开命名编辑弹窗。

## Release Gate

- FAIL：hosted CI、PostgreSQL/staging、Attack Chain manual verification、安全签字、首次灰度、14 天 P0/P1=0 观察仍缺。
