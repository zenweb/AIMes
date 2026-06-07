# 2026-05-31 Sprint 5 Dead Integration Stubs Review

## 结论

- 本地审计通过：ERP/WMS/AGV/设备命令 Stub 只在 DI 注册与自身接口中出现，没有业务消费者。
- 删除后 API 项目可编译，说明当前运行时依赖图不需要这些占位集成服务。

## 覆盖点

- `ServiceCollectionExtensions.AddApplicationServices` 不再注册未消费的集成 Stub。
- `MES.Domain.Interfaces.Integration` 目录下的占位接口和 DTO 已删除。
- `MES.Infrastructure.Services` 下对应 `*Stub` 文件已删除。
- 架构门禁会同时检查文件存在和 DI 注册残留。

## 剩余风险

- 后续若重新接入 ERP/WMS/AGV/设备命令，应按真实用例重新设计接口和适配器，不应恢复本轮删除的 demo stub。
- 并行运行架构测试和 API build 时曾出现一次 DLL copy retry 警告，串行验证可避免该环境噪声。
