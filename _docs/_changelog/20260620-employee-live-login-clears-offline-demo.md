# 2026-06-20 Employee Live Login Clears Offline Demo

## Changed
- 登录页普通入口不再因为历史 `aimes_offline_demo=true` 而优先使用离线 demo 账号。
- 非显式 demo 登录会在调用 `/api/v1/auth/login` 前清理离线 demo 标记，后端登录成功后再次落盘为 `false`。
- 补充认证单测，覆盖“浏览器曾经进入离线 demo 后，普通后端登录仍应恢复 live 员工接口读取”的回归场景。

## Evidence
- `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts`
- 真实浏览器验证：手工写入 `localStorage.aimes_offline_demo=true` 后，从 `http://127.0.0.1:4173/scheduling/login` 使用 `admin/admin123` 登录，再进入 `/scheduling/employee`，页面未出现 `员工列表加载失败` 或 `Offline demo mode skipped backend request`。
