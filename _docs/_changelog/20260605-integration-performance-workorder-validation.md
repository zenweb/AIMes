# 2026-06-05 Integration Performance WorkOrder Validation

## 已完成
- 修正 `src/tests/MES.Tests.Integration/PerformanceTests.cs` 中的批量创建工单性能测试数据。
- 之前 `PlannedEndDate` 使用 `AddDays(1 + (i % 30))`，当 `i == 0` 时会与 `PlannedStartDate = UtcNow.AddDays(1)` 相等，触发 `CreateWorkOrderRequestValidator` 的 `PlannedStartDate < PlannedEndDate` 约束。
- 现在改为 `AddDays(2 + (i % 30))`，确保性能测试样本始终是合法工单请求。

## 验证
- `dotnet test src/backend/AIMes.slnx --no-restore`：通过，`MES.Tests.Integration` 174/174、`MES.Tests.Unit` 430/430、`MES.ArchitectureTests` 85/85、`MES.Tests.Evaluation` 2/2。
- `npm run build`：通过。
- `npm run lint`：通过。
- `npm run test:unit`：通过，497/497。
- `npm run test:e2e`：通过，260 个用例中 259 个稳定通过，1 个 admin.spec 用例首轮启动 flaky 后在 retry 中通过。
- `npm run test:e2e -- tests/e2e/admin.spec.ts`：通过，30/30。
