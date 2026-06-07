# 2026-05-31 Sprint 5 5.9 ScanEndpoints Lookup Issue

## 已处理

- 问题：`ScanEndpoints` 查询设备和工单时调用 `GetAllAsync` 后在内存里 `FirstOrDefault`。
  - 风险：扫码接口会随设备/工单表规模增长产生不必要的全表读取，现场扫码路径可能被大数据量拖慢。
  - 处理：新增设备/工单按 code 查询仓储方法，endpoint 改为定点查找。

## 行为变化

- 扫码返回 DTO 形状保持不变。
- 工单扫码仍支持工单号与 id 两种匹配方式。
- 设备扫码仍按 `EquipmentCode` 匹配。

## 未关闭事项

- 5.9 死代码删除仍需继续审计。
