# 2026-06-14 Changelog - 多目标推荐公式契约与真实浏览器证据

## 变更
- `BatchOptimizeResultDto` 新增 `RecommendationScoreFormula` 顶层元数据。
- 后端 `BatchOptimizeAsync` 返回公式版本 `v1-weighted-kpi-40-40-20`，并暴露利用率 40%、准时率 40%、换线效率 20%、换线 1000 分钟归一化说明。
- 前端 `ParetoCompare` 推荐卡展示公式版本、权重 `40/40/20` 与换线归一化口径。
- 前端在后端缺少或返回无效公式说明时 fail loud：`后端推荐公式说明缺失或无效`。
- demo fallback 使用同一套公式元数据，避免离线演示与真实 API 口径分叉。

## 验证
- 红灯：
  - 后端单测先因 `BatchOptimizeResultDto` 缺少 `RecommendationScoreFormula` 编译失败。
  - 前端单测先因推荐卡未显示 `公式 v1-weighted-kpi-40-40-20` 失败。
- 绿灯：
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests.BatchOptimizeAsync_ShouldExposeAuditableRecommendationScoreBreakdown"`：1 passed。
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests"`：15 passed。
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests.BatchOptimize_WithDueDate_ShouldReturnCompareResults"`：1 passed。
  - `npm run test:unit -- tests/unit/pareto-compare.test.ts`：36 passed。
  - `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因"`：1 passed。
  - `git diff --check -- <本片相关文件>`：通过，仅 LF/CRLF warning。

## 范围说明
- 未新增优化目标或新算法。
- 本片只精品化现有“排产多目标对比推荐”解释性与真实浏览器证据。
- 按负责人指示，15 天灰度观察跳过，不作为当前阻塞项。
