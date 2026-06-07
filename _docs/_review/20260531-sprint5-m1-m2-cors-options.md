# 2026-05-31 Sprint 5 M1/M2 CORS Options Review

## 结论

- 本地审计通过：Production CORS 的 `AllowedOrigins` 已纳入 `IOptions<CorsOptions>` + `ValidateOnStart()` 启动校验。
- Production policy 仍拒绝 wildcard，允许源来自标准化后的配置值。

## 覆盖点

- 缺少 `AllowedOrigins` 时，启动验证器抛出 `OptionsValidationException`。
- 已配置 `https://mes.example.com` 时，Production policy 只包含该 origin，且 `AllowAnyOrigin` 为 false。
- 架构测试防止 CORS 配置退回 raw section 读取、手写异常或临时 `BuildServiceProvider()`。

## 剩余风险

- `AddCorsServices` 仍在注册阶段绑定一次 `CorsOptions` 供 CORS policy builder 使用；启动失败语义由 `IStartupValidator`/Host 触发，不是裸 `BuildServiceProvider()` 自动触发。
- M1/M2 总验收还包括 DB 配置，本轮尚未关闭。
