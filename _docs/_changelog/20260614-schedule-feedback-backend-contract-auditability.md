# 2026-06-14 排产采纳反馈后端审计契约

## 变更
- `/api/v1/scheduling/adoption-feedback` 现在拒绝空白 `ReasonDetail`，返回 `修改原因说明不能为空`。
- `GetLatestFeedbackAsync` 只返回包含非空原因说明的反馈，避免历史脏记录覆盖前端可审计 snapshot。
- 后端集成测试覆盖空原因写入拒绝、latest 跳过不可审计记录，以及 Agent 采纳 latest 字段完整性。
- 应用服务单测锁定 latest snapshot 映射字段：决策、分类、原因、目标、时间、来源和 trace。

## 验证
- RED：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests.AdoptionFeedback_WithBlankReasonDetail_ShouldReturnValidationError|FullyQualifiedName~SchedulingControllerTests.GetLatestAdoptionFeedback_WhenLatestRecordHasBlankReasonDetail_ShouldSkipUnauditableRecord"`，2 failed，旧逻辑返回 201 且 latest 返回空白原因记录。
- GREEN：同一目标集成测试 2 passed。
- GREEN：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests.GetLatestAdoptionFeedbackAsync_WhenFeedbackExists_ShouldReturnAuditableSnapshot"`，1 passed。
- GREEN：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests"`，65 passed。
- GREEN：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests"`，12 passed。
- GREEN：`npm run test:e2e -- --project=chromium tests/e2e/scheduling.spec.ts`，Chromium 79 passed。

## 范围
- 精品化现有排产采纳反馈链路，不新增功能。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
