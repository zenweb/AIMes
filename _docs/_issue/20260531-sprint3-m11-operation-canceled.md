# 2026-05-31 Sprint 3 M11 Issue

## 已处理

- 问题：请求取消抛出的 `OperationCanceledException` 会被全局 `catch (Exception)` 处理成 500。
  - 处理：在泛化异常捕获前单独捕获 `OperationCanceledException`，返回 499 且不写 ProblemDetails。

## 待跟踪

- 如后续接入网关/Ingress 指标，需要确认 499 与上游日志口径一致。
- 如需观察取消量，可单独添加低等级结构化日志或指标，不应混入 5xx 错误率。
