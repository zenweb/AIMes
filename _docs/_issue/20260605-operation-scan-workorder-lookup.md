# 2026-06-05 OperationService Scan WorkOrder Lookup Issue

## 问题

- `OperationService.ScanAsync()` 在扫码未命中现有工序执行时，仍通过 `_workOrderRepository.GetAllAsync()` 拉全量工单后在内存中找订单号。
- 这会让现场扫码入口对工单表规模敏感，也与仓储直查的收口方向不一致。

## 处理目标

- 扫码入口改为直接按 code / id 读取工单。
- 保持现有事务边界、绑定操作员和工位的行为不变。

