# 2026-05-31 Sprint 3 H10 Issue

## 已处理

- 问题：`EquipmentEndpoints` 的设备状态 PATCH 端点缺少 `WithTags`。
  - 处理：补 `WithTags("设备管理")`。
- 问题：`SchedulingEndpoints` 的工单状态 PATCH 端点缺少 `WithTags`。
  - 处理：补 `WithTags("排产管理")`。

## 待跟踪

- 如果后续新增 endpoint 文件或新增 `group.Map*` 链路，必须保留 `WithTags(...)`，否则 H10 架构门会失败。
