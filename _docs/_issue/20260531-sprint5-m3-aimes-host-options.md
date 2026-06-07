# 2026-05-31 Sprint 5 M3 Aimes Host Options Issue

## 已处理

- 问题：Program 直接读取 `Aimes:TrustForwardedHeaders`、`Aimes:EnableSwagger`、`Aimes:DisableHttpsRedirect`。
  - 风险：host 级配置分散在 pipeline 代码中，无法被 M3 Options 门禁统一覆盖。
  - 处理：新增 `AimesHostOptions`，Program 通过集中绑定对象读取三个 host flags，并注册 `IOptions<AimesHostOptions>` 启动校验。

## 行为变化

- 三个开关的默认值仍为 `false`。
- 开发环境 Swagger 默认启用行为保持不变。
- 非开发环境 HTTPS redirect 仍可通过 `Aimes:DisableHttpsRedirect=true` 关闭。

## 未关闭事项

- 设计时配置入口与 Pro-only AI 配置仍需在后续配置审计中分别处理或记录豁免。
