# 2026-06-20 Frontend Preview SignalR Live Entry

- 修复 4173 standalone preview 下 SignalR 连接失败：前端 `/hubs/*` 不再经 Nitro preview routeRules 误代理，改为在 4173 预览入口直连当前 hostname 的 5003 API。
- 补充 Docker compose 本地 production 演示 CORS origin：允许 `http://127.0.0.1:4173` 和 `http://localhost:4173` 访问 5003 API/SignalR。
- 开发 `AllowAll` CORS 策略改为支持 credentialed SignalR 预检；Production 策略继续使用 `AllowedOrigins` 白名单。
- 验证：
  - `npm run test:unit -- tests/unit/signalr-url.test.ts tests/unit/notifications.store.test.ts tests/unit/dashboard-board.test.ts tests/unit/monitoring-board.test.ts`：PASS，4 files / 37 tests。
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "AllowAllPolicy_ShouldSupportStandalonePreviewSignalRCredentials|ProductionPolicy_WithConfiguredOrigin_ShouldEchoOriginWithoutWildcard|ProductionPolicy_WithoutAllowedOrigins_ShouldRejectStartup" --no-restore`：PASS，3 tests。
  - `npm run build`：PASS。
  - `docker compose build api && docker compose up -d api`：PASS。
  - CORS preflight `Origin: http://127.0.0.1:4173`：204 with `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials: true`。
  - Real browser: `admin/admin123` 登录后进入 `/scheduling/employee`，`/api/v1/employee` 200，`/hubs/*/negotiate` 200，页面显示“实时在线”，无 hub 错误。
