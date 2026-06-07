# 2026-06-07 Hosted CI second run fixes

## 变更

- 推送本地 Hosted CI root workflow 修复后，取得新 GitHub Actions hosted runner 证据。
- Agent Evaluation run `27085506747` 通过。
- CI run `27085506748` 暴露两个新失败点：
  - frontend `npm ci` 在 npm 10 下拒绝不同步的 `package-lock.json`。
  - backend integration tests 在 hosted runner 中因测试环境继承 Redis/RabbitMQ 外部依赖而返回 500/503。
- 使用 npm 10 重新对齐 `src/frontend/package-lock.json`。
- 在 `TestWebApplicationFactory` 和 `PerformanceTestWebApplicationFactory` 中显式关闭测试环境 Redis/RabbitMQ，并固定 InMemory vector store。

## 验证

- `npx -p npm@10 npm ci --dry-run --registry=https://registry.npmjs.org`
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --configuration Release --logger "trx" --collect:"XPlat Code Coverage" --results-directory TestResults/Integration`
- `dotnet format src/backend/AIMes.slnx --verify-no-changes --no-restore`
- `npm run lint`

## 边界

- 本轮只修 Hosted CI 新失败点，不扩大产品功能范围。
- Hosted CI gate 仍需下一次 GitHub Actions CI success run 才能关闭。
