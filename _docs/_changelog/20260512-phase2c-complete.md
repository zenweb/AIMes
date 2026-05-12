# Phase 2C 完成 — 插单与重排引擎

## 新增文件
- `src/MES.AI/Scheduling/LockPeriodManager.cs` — 锁定周期管理（默认8小时窗口）
- `src/MES.AI/Scheduling/InsertionPolicy.cs` — 插单策略配置（Default/Express/Conservative 预设）
- `src/MES.AI/Scheduling/IRescheduler.cs` — 重排接口 + ReschedulingResult/Request 模型
- `src/MES.AI/Scheduling/Rescheduler.cs` — 核心重排算法（插单/故障恢复/抢占模式）
- `src/MES.AI/Scheduling/ReschedulingTrigger.cs` — 重排触发器（协调 Rescheduler + ContextProvider + LockPeriodManager）
- `tests/MES.Tests.Unit/AI/ReschedulerTests.cs` — 10 个测试用例
- `tests/MES.Tests.Unit/AI/LockPeriodManagerTests.cs` — 5 个测试用例

## 功能
- 急单插入：按设备找最早间隙，支持 PriorityPreemptive 抢占策略
- 故障恢复：受影响工单自动迁移到可用设备或顺延
- 锁定保护：锁定期内的工单不被调整
- 扰动控制：MaxDisruptionRatio 限制最大扰动比率

## DI 注册
- LockPeriodManager / IRescheduler / ReschedulingTrigger 在 `ServiceCollectionExtensions.cs` 中注册

## 测试覆盖
- 112/112 全部通过（97 已有 + 10 Rescheduler + 5 LockPeriodManager）
