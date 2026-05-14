# Sprint 3 — 架构债 + 性能

> 领域模型封装加固 + 性能基准验证
> 日期: 2026-05-14

---

## 完成项

### S3.1: SchedulePlan 封装加固
- **文件**: `src/MES.Domain/Entities/Scheduling/SchedulePlan.cs`
- **改动**:
  - 所有 `internal set` → `private set`
  - `List<ScheduleItem> Items` → `IReadOnlyList<ScheduleItem>`（私有 `_items` 字段）
  - 新增 `AddItem()`、`AddItems()`、`RemoveItem()` 方法
  - 调用方更新：`SchedulingAppService.MapToSchedulePlan`、`SchedulingEndpoints` 改用 `AddItems()`

### S3.2: QualityInspection 封装加固
- **文件**: `src/MES.Domain/Entities/Quality/QualityInspection.cs`
- **改动**:
  - 所有 `internal set` → `private set`
  - `List<DefectRecord> Defects` → `IReadOnlyList<DefectRecord>`（私有 `_defects` 字段）
  - `Create()` 工厂方法新增可选 `id` 参数（与 Material 模式一致）
  - `Reject()`/`RecordDefect()` 改用 `_defects.Add()`

### S3.3: Material
- 实体已有行为方法 + `internal set`（非 public），封装程度已达标，无需机械修改

### S3.4: 修复受影响测试
- **文件**: `tests/MES.Tests.Unit/Domain/SchedulePlanTests.cs`
  - 属性初始化器 → 工厂方法 + `AddItem()` 调用
  - 新增 `SchedulePlan_ShouldLockUnlockAndAdopt` 测试
- **文件**: `tests/MES.Tests.Unit/Domain/QualityInspectionTests.cs`
  - 属性初始化器 → 工厂方法，`Defects.Add()` → `RecordDefect()`
- **文件**: `tests/MES.Tests.Unit/Application/QualityAppServiceTests.cs`
  - List 初始化改用 `QualityInspection.Create()` 工厂方法
- **文件**: `tests/MES.Tests.Unit/Application/SchedulingAppServiceTests.cs`
  - `new SchedulePlan { ... }` → `SchedulePlan.Create()`

### S3.5: 规则引擎性能基准（已存在）
- **文件**: `tests/MES.Benchmarks/Benchmarks/SchedulingRuleEngineBenchmark.cs`
- BenchmarkDotNet 基准测试覆盖 10/50/100/500 工单场景
- **文件**: `tests/MES.Tests.Integration/PerformanceTests.cs`
- 集成测试性能套件覆盖 GET/POST 50/100/200 工单场景

### S3.6: 端到端集成测试（已存在）
- 85 个集成测试全部通过，覆盖排产、设备、质量、物料等核心端点

---

## 验证结果

| 套件 | 状态 |
|------|------|
| 单元测试 | ✅ 239/239 通过 |
| 集成测试 | ✅ 85/85 通过 |
| 构建 | ✅ 0 错误 0 警告 |
| Benchmarks 项目构建 | ✅ 通过 |

## Sprint 3 完成状态

| 编号 | 描述 | 状态 |
|------|------|------|
| S3.1 | SchedulePlan 封装 | ✅ 完成 |
| S3.2 | QualityInspection 封装 | ✅ 完成 |
| S3.3 | Material 封装 | ✅ 确认达标 |
| S3.4 | 测试修复 | ✅ 完成 |
| S3.5 | 性能基准 | ✅ 已存在 |
| S3.6 | 端到端测试 | ✅ 已存在 |

---

## 整体修复进度

| Sprint | 状态 |
|--------|------|
| Sprint 0: 6 Showstoppers | ✅ 完成 |
| Sprint 1: Critical/High 安全链 | ✅ 完成 |
| Sprint 2: 数据层 + 端点合规 | ✅ 完成 |
| Sprint 3: 架构债 + 性能 | ✅ 完成 |

**全部 4 个 Sprint 已完成。** 系统已按审计修复计划完成全部修复。
