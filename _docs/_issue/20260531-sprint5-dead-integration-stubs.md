# 2026-05-31 Sprint 5 Dead Integration Stubs Issue

## 已关闭

- `ErpServiceStub`、`WmsServiceStub`、`MaterialCallServiceStub`、`MaterialDeliveryTrackerStub`、`EquipmentCommandServiceStub` 及其 Domain integration 接口只注册进 DI，当前没有应用服务或端点消费。
- 风险：未接线 demo stub 会误导后续维护者，以为系统已有 ERP/WMS/AGV/设备控制集成能力。

## 处理

- 删除未消费的集成接口、DTO 和 Stub 实现。
- 移除对应 DI 注册。
- 新增架构门禁防止这些占位服务重新进入运行时依赖图。

## 待跟踪

- 如果产品路线需要真实外部集成，后续应从业务用例、错误处理、幂等、超时和审计契约重新建模。
