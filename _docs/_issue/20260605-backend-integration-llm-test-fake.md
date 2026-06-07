# 2026-06-05 Backend Integration LLM Test Fake Issues

## Fixed

- 问题：Integration 测试中的排产优化接口依赖真实 LLM，导致本地无 LLM 服务时 100s 超时。
- 风险：Sprint 0 / 0.0 测试基线失真；同一个测试可能因为外部 LLM 环境而红，无法判断代码回归。
- 处理：在 `TestWebApplicationFactory` 注入确定性的 `IScheduleOptimizationService` fake，隔离外部 LLM。
- 验证：目标红项 `2 passed`，完整 Integration `174 passed`，后端 Unit `430 passed`，Evaluation `2 passed`，Architecture `85 passed`。

## Remaining

- 真实 LLM / Ollama / Azure OpenAI 可用性仍需 staging 或专门 smoke 测试验证。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- 当前 `origin` 仍不指向 GitHub host remote；Hosted CI 不应继续空跑。
