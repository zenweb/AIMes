# Review: 人员替班/资质阻断后端 Readback 证据补强

## 结论
- 部分通过。后端 API 与服务层证据充分证明端点读写、EvidenceLink 落库和 AuditLog 落库；但 Docker live readback 未完成。

## 发现
- Docker API 不可达，不能启动或查询当前容器状态。
- `dotnet test` 集成测试常规 build 会触发 `MES.Api.csproj` 的 `CopyFrontendBuild` target，删除 `wwwroot/scheduling` 时遇到占用/权限问题。
- 使用 `--no-build` 成功执行已编译集成测试，证明当前编译产物下 `ExecutionEvidenceApi` 用例通过。

## 风险
- 真实 Docker/PostgreSQL 环境仍缺一次 live readback 证据。
- `CopyFrontendBuild` 在测试构建中容易受前端静态文件占用影响，后续可考虑给测试构建加跳过前端拷贝开关。
