# 2026-05-31 Sprint 5 M1/M2 JWT Options Issue

## 已处理

- 问题：JWT 配置在 `Program.cs` 与 `AuthEndpoints` 中通过 raw `IConfiguration` 读取。
  - 风险：配置校验分散，发 token 与验 token 可能读取不同 fallback。
  - 处理：新增 `JwtOptions`，统一 issuer/audience/signing key，并启用启动时校验。

## 行为变化

- 启动校验异常类型从手写 `InvalidOperationException` 变为框架标准 `OptionsValidationException`。
- 现有启动失败语义保持：缺失或短签名密钥仍拒绝启动。

## 未关闭事项

- DB 配置仍需迁移到 `IOptions<T>` + `ValidateOnStart()`。
- CORS 配置仍需迁移到 `IOptions<T>` + `ValidateOnStart()`。
