# 2026-06-07 Hosted CI integration diagnostics

## 变更

- 记录 CI run `27085892067` 的新状态：frontend 与 security 已通过，backend integration 仍失败。
- 为 Auth 与 endpoint authorization integration tests 增加失败时响应体输出。
- 目标是让下一次 hosted runner 失败日志直接包含 API problem details，避免继续盲猜 500/503 根因。

## 验证

- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --configuration Release --filter "FullyQualifiedName~AuthControllerTests|FullyQualifiedName~EndpointAuthorizationTests"`
- `dotnet format src/backend/AIMes.slnx --verify-no-changes --no-restore`

## 边界

- 本轮不改变业务期望。
- Hosted CI gate 仍为 FAIL，等待下一次 hosted runner 证据。
