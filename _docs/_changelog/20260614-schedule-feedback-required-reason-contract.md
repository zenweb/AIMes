# 2026-06-14 排产反馈原因必填契约收紧

## 变更
- `AdoptionFeedbackRequest.ReasonDetail` 从可空改为必填非空字符串，并补 `Required` 错误信息。
- `AdoptionFeedbackSnapshotDto.ReasonDetail` 从可空改为非空字符串，和 latest 接口“只返回可审计反馈”的运行时行为一致。
- `SchedulingAppService.GetLatestAdoptionFeedbackAsync` 增加防御：即使仓储异常返回空原因记录，也不构造不可审计 snapshot。
- 增加 DTO nullability 契约测试，防止后续把采纳原因重新放宽为可空。

## 验证
- RED：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests.AdoptionFeedbackDtos_ShouldDeclareReasonDetailAsRequiredContract"`，旧 DTO 契约显示 `ReasonDetail` 为 nullable。
- GREEN：同一 DTO 契约测试 1 passed。
- GREEN：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests"`，13 passed。
- GREEN：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests"`，65 passed。
- GREEN：`npm run test:e2e -- --project=chromium tests/e2e/scheduling.spec.ts`，Chromium 79 passed。

## 范围
- 精品化现有排产采纳反馈链路，不新增功能。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
