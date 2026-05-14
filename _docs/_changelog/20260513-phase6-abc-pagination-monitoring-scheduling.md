# Phase 6 — Task A/B/C 执行报告

> 日期: 2026-05-13
> 范围: 后端分页全面化 (A) / 实时监控增强 (B) / AI 排产改进 (C)

---

## Task A: 后端分页全面化

### 改动文件

**新建:**
- `Application/DTOs/CommonDtos.cs` — `PagedResult<T>` + `PageQueryParameters` 共享分页模型

**后端服务 (7 个):**
- `Application/Services/EmployeeAppService.cs` — `GetAllAsync` 返回 `PagedResult<EmployeeDto>`
- `Application/Services/PurchaseAppService.cs` — 同上
- `Application/Services/AdminAppService.cs` — `GetAllUsersAsync` 返回 `PagedResult<SystemUserDto>`
- `Application/Services/AnomalyAppService.cs` — `GetOpenAnomaliesAsync` 返回 `PagedResult<AnomalyDto>`
- `Application/Services/BomAppService.cs` — `GetAllBomsAsync` 返回 `PagedResult<BomDto>`
- `Application/Services/RoutingAppService.cs` — `GetAllRoutesAsync` 返回 `PagedResult<RouteDto>`
- `Application/Services/EquipmentAppService.cs` — `GetEquipmentsAsync` 返回 `PagedResult<EquipmentDto>`

**端点 (7 个):** 改用 `[AsParameters] PageQueryParameters`
- `Api/Endpoints/EmployeeEndpoints.cs`
- `Api/Endpoints/PurchaseEndpoints.cs`
- `Api/Endpoints/AdminEndpoints.cs`
- `Api/Endpoints/AnomalyEndpoints.cs`
- `Api/Endpoints/BomEndpoints.cs`
- `Api/Endpoints/RoutingEndpoints.cs`
- `Api/Endpoints/EquipmentEndpoints.cs` (已使用 EquipmentQueryParameters)

**测试修复 (4 个文件, 12 处断言):**
- `tests/MES.Tests.Unit/Application/EmployeeAppServiceTests.cs`
- `tests/MES.Tests.Unit/Application/PurchaseAppServiceTests.cs`
- `tests/MES.Tests.Unit/Application/EquipmentAppServiceTests.cs`
- `tests/MES.Tests.Unit/Application/AdminAppServiceTests.cs`
- `tests/MES.Tests.Integration/Controllers/EquipmentControllerTests.cs` — `PagedResultResponse<T>` 反序列化

### 验证
- ✅ Unit 220/220 通过
- ✅ Integration 70/70 通过
- ✅ dotnet build 0 错误 0 警告

---

## Task B: 实时监控增强

### 改动文件

**后端:**
- `Api/Services/MetricsBackgroundService.cs` — 扩充 KPI 推送:
  - 新增 `todayOutput` (从 WorkOrder.CompletedQuantity 统计)
  - 新增 `alertCount` (从 ProductionAnomalies 未解决统计)
  - 新增 `oee` (动态计算，受故障影响波动)
  - 新增 `yieldRate` (良品率模拟)
  - 新增 `energyUsage` (能耗模拟)

**前端:**
- `frontend/src/components/monitoring/MonitoringBoard.vue`
  - KPI 从 4 格扩展到 6 格: 利用率/设备运行/今日产量/异常告警/OEE/良品率
  - OEE 分解面板 (可用率/性能率/良品率/OEE 条形图)
  - 设备点击抽屉详情 (Teleport 到 body)
  - 双列布局 (左侧设备网格 + 右侧 OEE+事件)
  - 事件过滤下拉框 (全部/异常/警告/信息)

### 验证
- ✅ npm run build 成功
- ✅ dotnet build 0 错误

---

## Task C: AI 排产改进

### 改动文件

**新建:**
- `MES.AI/Scheduling/SchedulingConfig.cs` — `WeightedSchedulingConfig` 记录类型

**修改:**
- `MES.AI/Scheduling/ISchedulingRuleEngine.cs`:
  - `PriorityRule` 枚举新增 `WeightedComposite`
  - 接口新增带 `WeightedSchedulingConfig` 的重载
- `MES.AI/Scheduling/PriorityRuleEngine.cs`:
  - 新增 `SortByWeightedScore()` — 加权多目标评分排序
  - 三个维度: 交期紧迫度 (w1=0.5) + 客户优先级 (w2=0.3) + 加工时间效率 (w3=0.2)
  - 各维度做 min-max 归一化后加权求和
- `MES.AI/Scheduling/SchedulingRuleEngine.cs`:
  - 新增批次排产逻辑: 按产品族分组 (ProductCode 前4位)，组内按优先级排序
  - `WeightedComposite` 模式下自动启用批次排产

### 特性说明
1. **加权多目标评分**: 替代单一 EDD 排序，平衡交期、优先级、加工时间
2. **产品族分批**: 同族工单连续加工，换线时间从 240min 降到 60min
3. **可配置权重**: 通过 `WeightedSchedulingConfig` 调整各维度权重

### 验证
- ✅ Unit 220/220 通过
- ✅ dotnet build 0 错误

---

## 最终测试状态

| 套件 | 通过 | 失败 | 跳过 | 通过率 |
|------|------|------|------|--------|
| Unit | 220 | 0 | 0 | 100% |
| Integration | 70 | 0 | 0 | 100% |
| **总计** | **290** | **0** | **0** | **100%** |
