# 2026-06-14 Changelog - 多目标推荐分数组成后端契约

## 变更
- 后端 `ObjectiveCompareItemDto` 新增 `RecommendationScoreBreakdown`，把推荐综合分拆为利用率、准时率、换线三项贡献。
- `SchedulingAppService.BatchOptimizeAsync` 使用同一份 breakdown 汇总 `RecommendationScore`，避免前端和后端各自解释公式。
- 前端 `ParetoCompare` 推荐卡展示后端返回的贡献值；真实接口缺少总分或组成时 fail-loud，阻止展示采纳入口。
- 前端新增总分与 breakdown 求和一致性校验；后端若返回相互矛盾的推荐分数，会 fail-loud。
- 离线 demo 仍本地生成 breakdown，仅用于显式 demo fallback。

## 验证
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "auditable recommendation score breakdown"`：1 passed。
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "does not match its breakdown"`：1 passed。
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`：36 passed。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests.BatchOptimize_WithDueDate_ShouldReturnCompareResults"`：1 passed。
- `npm run test:e2e -- --grep "批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因"`：1 passed。

## 审计
- `git diff --check` 针对此片文件通过，仅报告 LF/CRLF 提示。
- 敏感扫描未发现真实密钥；命中项为测试/业务标识字符串。

## 范围说明
- 不恢复 15 天灰度观察为当前阻塞项。
- 不新增推荐公式，只把已有综合分解释升级为后端单一来源。
