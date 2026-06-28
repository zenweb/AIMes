# 2026-06-14 Review - 多目标推荐分数后端契约

## 结论
- 当前切片把真实后端响应的推荐分数来源收敛到后端，降低前后端公式漂移风险。
- 前端仍保留最高分一致性校验，但排序依据改为后端返回的 `recommendationScore`。
- 缺少推荐分数时会 fail-loud，不允许用户采纳无法审计的推荐卡。

## 关注点
- demo fallback 仍有本地分数计算；这是离线演示边界，不参与真实后端契约。
- 后续若推荐公式继续演进，应优先在后端服务中调整，并保持 `recommendationScore` 响应字段稳定。

## 已验证
- `pareto-compare.test.ts`：35 passed。
- `SchedulingControllerTests.BatchOptimize_WithDueDate_ShouldReturnCompareResults`：1 passed。
- 真实 Chromium 批量方案反馈路径：1 passed。
