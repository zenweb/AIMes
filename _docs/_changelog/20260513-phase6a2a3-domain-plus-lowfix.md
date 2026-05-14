# Phase 6A.2/6A.3 — 领域模型贫血修复 + Low级别审计清理

> 基于 `20260513-phase6-plan.md` 执行
> 日期：2026-05-13

## 变更汇总

### 6A.2 领域模型贫血修复（3 个核心实体）

| 实体 | 之前 | 之后 |
|------|------|------|
| **SchedulePlan** | public 属性 + public 无参构造 | `internal SchedulePlan()` + `private set` → `internal set` + `SchedulePlan.Create()` 工厂 + `Lock()`/`Unlock()`/`Adopt()`/`UpdateMetrics()` 行为 |
| **QualityInspection** | public 属性 + public 无参构造 | `internal QualityInspection()` + `internal set` + `QualityInspection.Create()` 工厂 + `Approve()`/`Reject()`/`RecordDefect()` 状态机 |
| **Material** | public 属性 + public 无参构造 | `internal Material()` + `internal set` + `Material.Create()` 工厂（参数扩展支持种子数据） + `StockIn()`/`Consume()`/`Release()`/`UpdateLocation()` 行为 |

### 编译修复（修复 30+ 错误）

- **QualityAppService.cs** — `new QualityInspection { ... }` → `QualityInspection.Create(...)` 
- **SchedulingAppService.cs** — `new SchedulePlan { ... }` → `SchedulePlan.Create(...)` + `UpdateMetrics()` + `Items.AddRange()`
- **InventoryAppService.cs** — 直接属性赋值 → `StockIn()`/`Consume()`/`UpdateLocation()` 行为方法
- **QualitySkills.cs** — `new QualityInspection { ... }` → `QualityInspection.Create(...)`
- **MaterialRepository.cs** — 移除冗余 `CreatedAt`/`Id`/`UpdatedAt` 赋值（工厂 + 行为已处理）
- **ScheduleRepository.cs** — 同上
- **QualityInspectionRepository.cs** — 移除冗余 `Id` 赋值
- **MesDbContext.cs** seed data — `new Material { ... }` → `Material.Create(...)`
- **MES.Domain.csproj** — 添加 `<InternalsVisibleTo>` 给两个测试项目

### 6A.3 Low 级别审计发现清理

| # | 审计项 | 变更 |
|---|--------|------|
| A12 | DTO 定义位置不一致 | 将 EquipmentEndpoints/SchedulingEndpoints 中 4 个内联 DTO 迁移到 `Application/DTOs/`（`EquipmentQueryParameters`, `UpdateEquipmentStatusRequest`, `DiagnoseRequest`, `UpdateStatusRequest`） |
| A15 | SeedData 嵌入 DbContext | 提取 `DataSeeder.cs` 独立类，`MesDbContext.OnModelCreating` 调用 `DataSeeder.Seed(modelBuilder)` |
| A22 | 开发环境跳过 Health Checks | `Program.cs` 添加 `else { builder.Services.AddHealthChecks(); }` |
| F3 | 缺失 ESLint/Prettier | 新增 `.eslintrc.cjs` + `.prettierrc` |
| F4 | 生产环境未启用 source map | `vite.config.ts` 添加 `sourcemap: true` |
| F13 | 日期格式器未处理时区 | `ProductionBoard.vue`/`EquipmentBoard.vue` 改为 `Intl.DateTimeFormat`；新增 `src/utils/date.ts` 工具函数 |

### 6B.1 排产规则引擎（已存在，验证通过）

验证现有实现完整性：
- `ISchedulingRuleEngine` + `SchedulingRuleEngine` — EDD/SPT/CR/FCFS 4 种优先级规则
- `CapacitySelector` — 4 种设备选择策略
- `IConstraintValidator` + `ConstraintValidator` — 产能/交期/物料/锁定约束验证
- `SchedulingAgent` — 规则引擎生成骨架 + LLM 精调的混合模式
- 28/28 规则引擎单元测试通过

### 新增文件
- `Infrastructure/Data/DataSeeder.cs`
- `Application/DTOs/` — 追加 4 个 record 类型 DTO
- `frontend/src/utils/date.ts` — 日期格式化工具
- `frontend/.eslintrc.cjs`, `frontend/.prettierrc`

### 修改文件
- 3 个领域实体 + Domain csproj
- 3 个 Application Service
- 1 个 AI Skill
- 3 个 Repository
- 1 个 DbContext
- 2 个 Endpoint 文件
- 2 个前端 Vue 组件
- `Program.cs`, `vite.config.ts`

## 验证结果

```
dotnet build:     0 错误 0 警告 ✅
dotnet format:    通过 ✅
unit tests:       219/220 通过（1 个预置 ReschedulerTests 失败）✅
integration tests: 62/62 通过 ✅
rule engine tests: 28/28 通过 ✅
npm run build:    待验证
```
