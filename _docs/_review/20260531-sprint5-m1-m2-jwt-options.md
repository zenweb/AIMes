# 2026-05-31 Sprint 5 M1/M2 JWT Options Review

## 结论

- 本地审计通过：JWT 配置已从 raw `IConfiguration` 迁到 `IOptions<JwtOptions>`，并通过 `ValidateOnStart()` 在启动时失败。
- 登录、刷新 token 的 issuer/audience 与 JwtBearer 验证参数共用同一份 `JwtOptions`。

## 覆盖点

- `SigningKey` 缺失或短于 32 字节时，启动阶段抛出 `OptionsValidationException`。
- `SigningKeyStore` 从已验证 Options 构造。
- `AuthEndpoints` 不再注入 `IConfiguration` 用于 JWT 生成。
- 架构测试防止 JWT 配置读取回退。

## 剩余风险

- M1/M2 总验收还包括 DB/CORS，本轮尚未关闭。
- `QdrantHealthCheck`、Messaging、Cache 等非 M1/M2 范围仍有直接配置读取，需按后续任务逐项处理。
