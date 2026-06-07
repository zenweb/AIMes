# 2026-05-31 Sprint 5 M1/M2 DB Options Issue

## 已处理

- 问题：运行时 DB provider 与 default connection string 在 `AddDatabaseServices` / health check 中直接读取配置并手写异常。
  - 风险：配置校验分散，启动失败类型不统一，后续容易绕过 Options 校验策略。
  - 处理：新增 `DatabaseOptions`，集中绑定 provider 与 default connection string，并启用启动时 Options 校验。

## 行为变化

- 运行时缺少 `ConnectionStrings:DefaultConnection` 或 provider 不支持时，启动校验异常类型统一为 `OptionsValidationException`。
- DB health check 使用同一套 `DatabaseOptions` 绑定结果判断是否注册 PostgreSQL ready check。

## 未关闭事项

- Sprint 5 后续仍需推进 M3、H16/H17、H1、M13、5.9 死代码/ScanEndpoints 等任务。
