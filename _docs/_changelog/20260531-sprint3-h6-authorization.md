# 2026-05-31 Sprint 3 H6 授权默认保护

## 变更

- H6：新增集成测试 `EndpointAuthorizationTests`，验证非 `/auth` 的 `/api/v1/*` 示例端点在显式匿名请求下返回 `401`。
- H6：测试认证器 `TestAuthHandler` 新增 `X-Test-Anonymous: true`，用于绕过测试默认登录身份，模拟真实未登录请求。
- H6：新增架构门 `H6ApiV1RouteGroupsExceptAuth_ShouldRequireAuthorization`，扫描 `Program.cs` 中 `/api/v1/*` route group，要求除 `/api/v1/auth` 外均具备 group-level `RequireAuthorization()`。
- 修复 M7 后遗留的模型种子漂移：`DataSeeder` 的 `Equipment` 模型种子补齐 shadow concurrency token `version = 0u`，避免测试启动期 EF InMemory 校验失败。

## 红灯证据

- 新增 H6 集成测试初次执行未进入授权断言，启动期失败：
  - `The seed entity for entity type 'Equipment' cannot be added because no value was provided for the required property 'version'.`
  - 结论：M7 为 Equipment 增加 shadow concurrency token 后，模型种子未同步版本字段，阻断集成测试启动。
- H6 route group 实现已基本存在，本轮以运行时匿名请求测试和架构门做防回归刻画，不伪造“实现缺失”红灯。

## 验证

- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~EndpointAuthorizationTests" --no-restore`
  - 通过：4/4
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~H6" --no-restore`
  - 通过：1/1
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：15/15
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors
- `git diff --check` 本轮触碰文件
  - 通过；仅保留既有 LF/CRLF 提示

## 备注

- `/health` 保持匿名可访问，用于平台探针。
- `/api/v1/auth/login` 保持匿名可访问，是明确的登录入口。
- 并行验证时曾触发一次 StaticWebAssets 压缩资产缺失；串行复跑 H6 集成测试通过，判断为并行 build/test 争用 `obj` 输出，不作为 H6 业务失败。
