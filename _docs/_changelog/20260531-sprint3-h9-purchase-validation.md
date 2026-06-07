# 2026-05-31 Sprint 3 H9 Purchase 状态变更校验过滤器

## 变更

- H9：为 Purchase 状态变更端点补 `ValidationEndpointFilter`：
  - `POST /api/v1/purchase/{id}/submit`
  - `POST /api/v1/purchase/{id}/confirm`
  - `POST /api/v1/purchase/{id}/cancel`
- H9：新增架构门 `H9PurchaseStateChangeEndpoints_ShouldUseValidationEndpointFilter`，防止 submit/confirm/cancel 后续回退。

## 红灯证据

- 新增 H9 架构门初次执行失败：
  - `PurchaseEndpoints.cs: group.MapPost("/{id}/submit", SubmitAsync) missing ValidationEndpointFilter`
  - 结论：Purchase submit/confirm/cancel 状态变更端点未统一进入共享 validation filter。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~H9" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：17/17
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors
- `git diff --check` 本轮触碰文件
  - 通过；仅保留既有 LF/CRLF 提示

## 备注

- 本轮只补计划点名的 submit/confirm/cancel，不改变 Purchase handler 签名、通知逻辑或事务边界。
- 当前三个端点没有请求 DTO，`ValidationEndpointFilter` 主要用于保持端点层共享校验链路一致性，并为后续状态变更请求体扩展预留统一入口。
