# Dashboard/Login E2E Real Browser Closure

日期：2026-06-30

## 范围

- Login 未登录访问受保护页面的跳转断言。
- Dashboard 5 分钟 Demo 彩排证据写入后，报表证据链与审计回放的真实浏览器验证。

## 修复

- `tests/e2e/login.spec.ts`
  - 将未登录跳转断言从 `**/login` 放宽为 `/\/login(?:\?.*)?$/`，保留 `?redirect=/scheduling` 这类真实路由回跳参数。
- `tests/e2e/dashboard.spec.ts`
  - 将 Demo 彩排证据 mock 从 `**/api/v1/scheduling/otd-evidence` 改为 `**/api/v1/scheduling/otd-evidence**`，覆盖真实请求里的 `?take=24` 查询串。

## 验证

- `npm run test:e2e -- tests/e2e/login.spec.ts`
  - 11 passed。
- `npm run test:e2e -- tests/e2e/dashboard.spec.ts -g "5 分钟 Demo 彩排确认进入报表证据链和审计回放"`
  - 1 passed。
- `npm run test:e2e -- tests/e2e/dashboard.spec.ts`
  - 13 passed。
- `npm run test:e2e`
  - Exit code 0。
  - 387 passed / 3 skipped / 0 failed。
  - 耗时 7.6 分钟。
- `git diff --check`
  - 无空白错误；仅有 Windows CRLF 提示。

## 结论

Dashboard 红线不是产品证据链缺失，而是 E2E mock 没覆盖带查询串的真实浏览器请求。修复后，彩排证据能进入报表证据链并进入审计回放断言。

完整真实浏览器 E2E 已取得命令级 exit 0 证据；当前剩余 skipped 均为 live staging 类显式跳过项，不是失败。

## 剩余跳过项

- `tests/e2e/scheduling-live-staging.spec.ts`
  - 真实 dhtmlx live staging 拖拽保存后刷新读回 PostgreSQL 窗口。
  - 真实 dhtmlx live staging 拖拽被非可编辑计划拒绝时不误报保存成功。
