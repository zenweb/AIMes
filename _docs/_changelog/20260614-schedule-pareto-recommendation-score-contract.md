# 2026-06-14 多目标推荐分数后端契约

## 变更
- `ObjectiveCompareItemDto` 新增 `RecommendationScore`，由后端 `BatchOptimizeAsync` 计算并返回。
- `ParetoCompare.vue` 推荐卡改为展示后端 `recommendationScore`，不再对真实后端响应复算推荐分数。
- 前端新增 fail-loud 校验：后端对比方案缺少推荐分数或分数越界时，不渲染推荐卡和采纳入口。
- demo fallback 仍保留本地计算，仅用于显式离线演示数据。

## 验证
- RED：缺少 `recommendationScore` 时，前端旧逻辑仍展示推荐卡。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，35 passed。
- GREEN：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests.BatchOptimize_WithDueDate_ShouldReturnCompareResults"`，1 passed。
- GREEN：`npm run test:e2e -- --grep "批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因"`，1 passed。

## 范围
- 继续深挖排产多目标对比现有功能，不新增模块。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
