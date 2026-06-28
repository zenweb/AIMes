# 2026-06-21 Frontend Employee Demo Deeplink Pass

- 受保护页跳转登录时新增站内 `redirect` 参数，显式离线演示入口保留 `offlineDemo=1`。
- 登录成功后回到原始站内目标页，避免员工页入口被固定送到 dashboard。
- 增加单测覆盖站内 redirect 和非站内 redirect 回退。
- 追加真实浏览器覆盖：未登录访问 `/employee?offlineDemo=1` 后登录返回员工页，且不展示 `Offline demo mode skipped backend request`。
- 本轮验证：
  - `npm run test:unit -- tests/unit/router-auth.test.ts tests/unit/login-page.test.ts tests/unit/auth.store.test.ts tests/unit/employee-board.test.ts --maxWorkers=1 --no-file-parallelism`：67/67 通过。
  - `npm run test:e2e -- tests/e2e/employee.spec.ts -g "未登录访问离线演示员工入口后登录返回员工页|显式离线演示入口展示本地员工"`：2/2 通过。
  - `npm run test:e2e -- tests/e2e/employee.spec.ts`：13/13 通过，覆盖人员能力、替班、停工复核、报表与审计回放链路。
