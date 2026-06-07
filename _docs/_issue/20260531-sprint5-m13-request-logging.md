# 2026-05-31 Sprint 5 M13 Request Logging Issue

## 已处理

- 问题：`RequestLoggingMiddleware` 与 `UseSerilogRequestLogging()` 并存。
  - 风险：重复请求日志、字段口径不一致、维护者误以为自定义 middleware 是标准日志入口。
  - 处理：删除自定义 middleware，仅保留 Serilog request logging。

## 行为变化

- 每个请求不再额外输出自定义 started/completed 两条日志。
- 请求日志由 Serilog middleware 统一负责。

## 未关闭事项

- 请求日志字段脱敏与采样策略不在本轮范围内。
