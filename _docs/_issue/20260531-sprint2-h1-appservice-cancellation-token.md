# 2026-05-31 Sprint 2 H1 AppService CT 问题记录

## 已解决

- 问题：`SchedulingAppService` 多处仓储调用未传 `CancellationToken`。
  - 影响：请求取消无法及时传播到排产相关数据库 I/O。
  - 处理：补齐设备、计划、工单、物料、BOM、采纳反馈等仓储调用的 CT。

- 问题：`QualityAppService` 质检创建/查询/统计/SPC 查询存在 CT 漏传。
  - 影响：质量相关长查询或创建操作无法响应请求取消。
  - 处理：补齐 `_inspectionRepo` 相关调用的 CT。

- 问题：`EquipmentAppService` 设备查询/统计/诊断/维护历史等路径存在 CT 漏传。
  - 影响：设备相关数据库 I/O 不受请求取消控制。
  - 处理：补齐 `_equipmentRepo` 相关调用的 CT。

## 过程中发现

- 单纯人工 grep 容易遗漏多行调用和私有 helper。
  - 处理：新增架构测试枚举 H1 计划点名服务中的已知裸调用片段，作为防回退门。

## 未解决

- 其它 AppService 的全量 CT 传播审计仍可继续扩展。
- Sprint 3 M11：`OperationCanceledException` 不进入 500 的端点/中间件处理仍待实施。
- OMX 外部代理审计仍不可用：缺 `C:\Users\陈奕铭\.codex\prompts`。
