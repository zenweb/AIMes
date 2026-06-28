# 2026-06-15 HTTP HTML fallback detection

- 加固前端统一 HTTP 响应拦截器：当 API 成功响应返回 `<html...` SPA fallback 且服务端未标 `text/html` 时，也会 fail loud 拒绝响应。
- 这个切片避免业务模块把后端不可用时返回的 HTML 当作 JSON/业务数据继续解析。
- 新增单测 `rejects HTML fallback responses even when the server omits text/html content type`，先验证旧行为会放行 HTML fallback，再最小修复。

验证：
- RED：`npm run test:unit -- tests/unit/http-refresh.test.ts --reporter=dot` 曾失败，错误为 promise resolved HTML response instead of rejecting。
- GREEN：`npm run test:unit -- tests/unit/http-refresh.test.ts --reporter=dot`：1 file / 6 tests passed。
- 局部 API 回归：`npm run test:unit -- tests/unit/http-refresh.test.ts tests/unit/knowledge-api.test.ts tests/unit/report-api.test.ts tests/unit/audit-log-api.test.ts --reporter=dot`：4 files / 12 tests passed。
