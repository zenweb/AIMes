# 2026-05-31 Sprint 3 M12 领域规则异常基类

## 变更

- M12：新增 `MES.Domain.Exceptions.DomainRuleViolationException`，用于表达领域实体规则违反。
- M12：将 Domain `Entities` 下状态机、库存、质检等领域规则抛出的 `InvalidOperationException` 替换为 `DomainRuleViolationException`。
- M12：`ExceptionMiddleware` 显式识别 `DomainRuleViolationException`，返回 400 `Domain Rule Violation`。
- M12：新增架构门 `M12DomainEntities_ShouldUseDomainRuleViolationExceptionForStateRules`，禁止领域实体继续抛泛化 `InvalidOperationException`。

## 红灯证据

- 新增 M12 架构门初次执行失败：
  - `Entities\Admin\SystemUser.cs`
  - 结论：Domain 实体仍有领域规则使用泛化 `InvalidOperationException`。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~M12" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~Domain|FullyQualifiedName~EquipmentTests|FullyQualifiedName~MaterialTests|FullyQualifiedName~QualityInspectionTests|FullyQualifiedName~SchedulePlanTests|FullyQualifiedName~OperationExecutionStateMachineTests|FullyQualifiedName~SystemUserTests" --no-restore`
  - 通过：113/113
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：20/20
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors
- `git diff --check` 本轮触碰文件
  - 通过；仅保留既有 LF/CRLF 提示

## 备注

- `DomainRuleViolationException` 继承 `InvalidOperationException`，保持既有调用方兼容性，同时提供更明确的领域语义。
- Application 层“资源不存在”等用例错误暂不纳入 M12，避免与领域实体规则混淆。
