# 2026-05-31 Sprint 3 H4 Issue

## 已处理

- 问题：`ValidationFilter` 与 `AuditAttribute` 是 MVC filter 路径的死代码，和当前 Minimal API `IEndpointFilter` 模式并存会造成维护误判。
  - 处理：删除两个旧文件，并新增架构门禁止文件或类型引用回流。

## 待跟踪

- H3：`AuditEndpointFilter` 仍直接操作 `MesDbContext`，需改为通过应用服务写审计。
