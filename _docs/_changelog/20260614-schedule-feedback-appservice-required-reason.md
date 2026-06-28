# 2026-06-14 排产反馈应用服务原因必填防绕过

## 变更
- `SchedulingAppService.RecordAdoptionFeedbackAsync` 增加应用层原因说明校验，空白 `ReasonDetail` 会在调用反馈服务、仓储和审计写入前被拒绝。
- 新增单测证明非 HTTP 调用路径不能绕过端点校验写入不可审计采纳反馈。
- 保留端点校验、DTO 必填契约和 latest 读取防御，形成多层一致约束。

## 验证
- RED：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests.RecordAdoptionFeedbackAsync_WithBlankReasonDetail_ShouldRejectBeforePersistence"`，旧逻辑未拒绝空原因并继续走到证据写入 NRE。
- GREEN：同一目标测试 1 passed。
- GREEN：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests"`，14 passed。
- GREEN：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests"`，65 passed。
- GREEN：`npm run test:e2e -- --project=chromium tests/e2e/scheduling.spec.ts`，Chromium 79 passed。

## 范围
- 精品化现有排产采纳反馈链路，不新增功能。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
