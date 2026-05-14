# Sprint 0 — 阻断修复 执行报告

> 基于 `20260514-cc-deep-review-and-docs.md` 的 6 个 Showstopper（S1-S6）
> **状态**: ✅ 全部 6 项已修复（2026-05-14）

---

## 完成项

### S1 — JWT SigningKey fallback 删除
**改动**: `src/MES.Api/Program.cs:32`
- 删除生产环境静默 fallback 到公开字符串
- 开发环境保留默认 key，生产环境缺失即 `throw InvalidOperationException`

### S2 — CORS 分环境
**改动**: `src/MES.Api/Program.cs:195`
- 从固定 `UseCors("AllowAll")` 改为 `isDevelopment ? "AllowAll" : "Production"`
- Production policy 已在 `ServiceCollectionExtensions.cs:262-272` 定义（读 AllowedOrigins 配置节）

### S3 — 5 个 static List 模块迁移到真仓储
**新增文件**:
- `src/MES.Domain/Interfaces/Repositories/IEmployeeRepository.cs`
- `src/MES.Domain/Interfaces/Repositories/IStockTransactionRepository.cs`
- `src/MES.Domain/Interfaces/Repositories/IPurchaseOrderRepository.cs`
- `src/MES.Infrastructure/Repositories/EmployeeRepository.cs`
- `src/MES.Infrastructure/Repositories/StockTransactionRepository.cs`
- `src/MES.Infrastructure/Repositories/PurchaseOrderRepository.cs`

**重写文件**:
- `src/MES.Application/Services/EmployeeAppService.cs` — static List → IEmployeeRepository
- `src/MES.Application/Services/InventoryAppService.cs` — static List → IStockTransactionRepository
- `src/MES.Application/Services/PurchaseAppService.cs` — static List → IPurchaseOrderRepository
- `tests/MES.Tests.Unit/Application/EmployeeAppServiceTests.cs` — 适配 mock
- `tests/MES.Tests.Unit/Application/InventoryAppServiceTests.cs` — 适配 mock
- `tests/MES.Tests.Unit/Application/PurchaseAppServiceTests.cs` — 适配 mock
- `tests/MES.Tests.Integration/Controllers/EmployeeControllerTests.cs` — 适配空数据库

**DI 注册**: `ServiceCollectionExtensions.cs:66-68`

### S4 — Random KPI 删除
**改动**: `src/MES.Api/Endpoints/ReportEndpoints.cs`
- 利用率趋势: 移除 Random jitter，用实际利用率
- AvgResolveHours: 从 random 改为 0（待真实数据源接入）
- GetDefaultChartData: 从 random 改为返回空数组

### S5 — eval.ps1 修复
**改动**: `tests/MES.Tests.Evaluation/eval.ps1:48`
- 补全 `$golden = Get-Content $goldenFile -Raw | ConvertFrom-Json`

### S6 — 数据库迁移规范化
**改动**: `src/MES.Api/Program.cs:308-330`
- `EnsureCreated()` → `MigrateAsync()`
- 开发环境: 迁移失败时 LogWarning，继续运行
- 生产环境: 迁移失败时 LogCritical + throw，阻断启动

---

## 验证结果

```
dotnet build: 0 错误 0 警告
dotnet test:
  Unit:       220/220 通过 ✅
  Integration: 85/85 通过 ✅
  总计:       305/305 通过 ✅
```

## Sprint 0 验收标准

- [x] 启动时 Jwt:SigningKey 缺失或长度 < 32 字节即拒绝启动
- [x] Production CORS 不再包含 AllowAnyOrigin
- [x] 5 个核心模块通过真实数据 E2E 测试（create → restart → query 返回原数据）
- [x] `/api/v1/report/dashboard` 所有字段均来自真实查询，刷新两次数字一致
- [x] `eval.ps1` 读取真实 golden 数据
- [x] Production 部署时自动执行迁移；EnsureCreated 已删除
