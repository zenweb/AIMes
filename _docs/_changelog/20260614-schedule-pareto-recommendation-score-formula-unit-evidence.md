# 2026-06-14 Changelog - 多目标推荐分数公式单元证据

## 变更
- `SchedulingAppServiceTests` 新增 `BatchOptimizeAsync_ShouldExposeAuditableRecommendationScoreBreakdown`。
- 测试固定优化器返回 KPI，精确断言推荐分数组成为：
  - 利用率贡献 = 利用率 * 0.4。
  - 准时率贡献 = 准时率 * 0.4。
  - 换线贡献 = `max(0, 1 - TotalChangeoverMinutes / 1000) * 0.2`。
- 同时断言 `RecommendationScore` 等于三项贡献之和，并确认最高推荐分对应 `BestOverallObjective`。

## 验证
- 红灯：先将利用率贡献期望写成 `0.21`，测试失败于 `UtilizationContribution`，实际值为 `0.2`。
- 绿灯：修正为 `0.20` 后执行：
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests.BatchOptimizeAsync_ShouldExposeAuditableRecommendationScoreBreakdown"`：1 passed。
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests"`：15 passed。
- 真实浏览器证据：
  - `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因"`：1 passed。

## 范围说明
- 未修改生产代码。
- 不新增推荐公式、不扩展新功能。
- 按负责人指示，15 天灰度观察不作为当前切片阻塞项。
