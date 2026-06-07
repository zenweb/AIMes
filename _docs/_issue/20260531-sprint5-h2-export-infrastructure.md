# 2026-05-31 Sprint 5 H2 Export Infrastructure Issue

## 已处理

- 问题：`IExportAppService` 的 DI 注册使用裸 `ExportAppService` 类型名，虽然当前解析到 Infrastructure 实现，但架构意图不够显式。
  - 风险：未来若 Application 层重新出现同名实现，注册可能在 review 中不够直观，增加 H2 回退风险。
  - 处理：使用 `InfrastructureExportAppService = MES.Infrastructure.Services.ExportAppService` 别名，并在 DI 中显式注册该实现。

## 未关闭事项

- 尚未为导出 Excel/PDF 内容做格式级回归测试。
- Sprint 5 其它架构债如 H5、M1/M2、M3、H16 等尚未在本轮处理。
