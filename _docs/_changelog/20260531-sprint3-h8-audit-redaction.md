# 2026-05-31 Sprint 3 H8 审计脱敏验证

## 变更

- H8：新增 `AuditRedactionTests`，直接验证 `AuditRedaction.RedactAndSerialize` 会遮蔽嵌套 `Password`、`ApiKey`、`SecretToken` 等敏感字段。
- H8：新增 Admin 集成测试 `CreateUser_ShouldRedactPasswordInAuditLog`，验证真实 endpoint audit 链路不会把创建用户的明文密码写入 `AuditLog.NewValues`。
- 测试支撑：`MES.Api` 开放 `InternalsVisibleTo` 给 `MES.Tests.Unit`，用于直接测试 internal redaction helper。

## 红灯证据

- 新增单元测试初次执行编译失败：
  - `CS0122: “AuditRedaction”不可访问，因为它具有一定的保护级别`
  - 结论：脱敏 helper 没有可直接测试入口，无法形成稳定防回归测试。

## 验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~AuditRedactionTests" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~CreateUser_ShouldRedactPasswordInAuditLog" --no-restore`
  - 通过：1/1
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：16/16
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors
- `git diff --check` 本轮触碰文件
  - 通过；仅保留既有 LF/CRLF 提示

## 备注

- 现有 `AuditRedaction` 实现已满足本轮核心脱敏行为，本轮主要补可执行验收与防回归测试。
- `AuditEndpointFilter` 仍在 H3 后续切片中处理应用服务依赖反转。
