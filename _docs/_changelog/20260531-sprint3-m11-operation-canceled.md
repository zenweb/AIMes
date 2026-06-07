# 2026-05-31 Sprint 3 M11 请求取消异常处理

## 变更

- M11：`ExceptionMiddleware` 新增 `OperationCanceledException` 独立处理分支。
- M11：取消请求返回 `499`，不再生成 `500` ProblemDetails。
- M11：新增单元测试 `ExceptionMiddlewareTests`，验证取消请求不会被当作应用故障。
- M11：新增架构门 `M11ExceptionMiddleware_ShouldHandleOperationCanceledSeparately`，要求取消异常在泛化异常处理前匹配。

## 红灯证据

- 新增单元测试初次执行失败：
  - 期望 `499`，实际 `500`。
  - 结论：`OperationCanceledException` 被 `catch (Exception)` 当作未处理异常进入 500 路径。

## 验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~ExceptionMiddlewareTests" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~M11" --no-restore`
  - 通过：1/1
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：19/19
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors
- `git diff --check` 本轮触碰文件
  - 通过；仅保留既有 LF/CRLF 提示

## 备注

- 本轮不改变其它异常到 ProblemDetails 的映射。
- 499 为非标准但常用的客户端关闭请求语义，避免把客户端取消计入服务端 5xx。
