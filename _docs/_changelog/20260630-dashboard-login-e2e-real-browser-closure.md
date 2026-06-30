# 2026-06-30 Dashboard/Login E2E Real Browser Closure

## Changed

- 修正 Login 受保护页面跳转断言，允许登录页携带真实 `redirect` 查询参数。
- 修正 Dashboard Demo 彩排证据链测试的 OTD evidence route mock，覆盖 `?take=24` 查询串。

## Verified

- Login E2E：11 passed。
- Dashboard 聚焦用例：1 passed。
- Dashboard E2E：13 passed。
- Full E2E：exit code 0，387 passed / 3 skipped / 0 failed，耗时 7.6 分钟。
- `git diff --check`：无空白错误，仅 CRLF 提示。
