# 2026-06-08 Sprint 0 Baseline Refresh Review

## 审计结论

- 2026-06-05 的“基线全绿”已不再能直接代表当前工作树。
- 当前基线已重跑并分类：
  - 后端：全绿
  - 前端 lint/build：全绿
  - 前端 unit：默认并行命令不稳定，串行复核可绿
  - 前端 e2e：存在 13 个真实红项

## 关键发现

- Integration 最初的大面积红并非业务整体回归，而是 `MES.Tests.Integration` 仍使用旧依赖图：
  - `AspNetCore.HealthChecks.Rabbitmq 8.0.1`
  - `MassTransit.RabbitMQ 9.0.0`
  - 导致运行时 `MissingMethodException`
- 强制 restore 后，Integration 恢复为 `175 passed`。
- `MES.Tests.Unit` 也存在同类旧依赖图 warning；强制 restore 后恢复为无 warning 绿。
- 前端 unit 的问题不是断言失败，而是默认并行 worker 启动超时；因此今天不能把 `npm run test:unit` 视作稳定基线。
- 前端 e2e 的 13 个失败是可重复、集中且跨 spec 的真实失败，不应降级为 flaky。

## 结论

- Sprint 0 / 0.0 已完成“摸清红/绿/flaky”的目标。
- 下一步优先级不该继续泛跑所有套件，而应集中修复前端 e2e 红链和 unit 默认并行稳定性。
