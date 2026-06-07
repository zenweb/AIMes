# 2026-05-31 Sprint 5 5.9 ScanEndpoints Lookup Review

## 结论

- 本地审计通过：扫码接口不再为设备/工单查询拉全量集合后内存过滤。
- 新增仓储方法均使用 EF `AsNoTracking()` + `FirstOrDefaultAsync(...)` 定点查询。

## 覆盖点

- 物料扫码继续复用已有 `IMaterialRepository.GetByCodeAsync`。
- 设备扫码使用 `IEquipmentRepository.GetByCodeAsync`。
- 工单扫码使用 `IWorkOrderRepository.GetByCodeAsync`，覆盖 `OrderNumber == code || Id == code`。
- 现有扫码集成测试覆盖未知 code、设备 code、物料 code。

## 剩余风险

- 当前集成测试未单独覆盖工单 code 扫描；本轮架构门覆盖了调用形态，后续可补业务级工单扫码集成样例。
- 5.9 的死代码删除尚未完成，需要继续审计。
