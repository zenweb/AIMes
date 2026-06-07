# 2026-06-05 QualityAgent Fail-closed Issue

## 问题

- `QualityAgent.InspectWithAIAsync()` 在历史检索失败、LLM 返回空结果或 LLM 抛错时，当前会回退到 `IsPassed = true`。
- 这会把“AI 不可用”包装成“检验通过”，属于质检语义上的 fail-open。

## 影响

- 视觉质检或相似案例分析不可用时，用户可能误判当前结果已通过，而不是进入人工复核。
- 该语义与 Sprint 2 的数据可靠性收口方向不一致。

## 处理目标

- 改为 fail-closed：AI 不确定时返回保守不通过结果，并明确要求人工复核。

