# 2026-05-31 Sprint 5 M1/M2 CORS Options Issue

## 已处理

- 问题：Production CORS `AllowedOrigins` 过去通过 raw `IConfiguration` 读取并手写启动失败。
  - 风险：配置校验分散，容易绕过统一 Options 启动校验策略。
  - 处理：新增 `CorsOptions`，统一配置绑定、允许源非空校验和启动时验证。

## 行为变化

- 启动校验异常类型从手写 `InvalidOperationException` 变为框架标准 `OptionsValidationException`。
- 测试触发点改为 `IStartupValidator.Validate()`，匹配 `ValidateOnStart()` 的实际启动语义。

## 未关闭事项

- DB 配置仍需迁移到 `IOptions<T>` + `ValidateOnStart()`。
