# 2026-05-30 Sprint 0 后续待办

## P0

- [x] 修复前端 lint 门禁的配置不可运行问题：让 `npm run lint` 在 ESLint 10 下可读取配置。
- [x] 修复 `tests/e2e/production.spec.ts` 的 “工单详情显示工序列表” 定位器歧义，并用目标 E2E 验证。
- [x] 完成 Sprint 0 / 0.1：删除 JWT SigningKey fallback，缺失或短 key 启动即失败。
- [x] 完成 Sprint 0 / 0.3：Production CORS 使用白名单源，空 `AllowedOrigins` 拒绝注册，不再使用 `AllowAnyOrigin`。
- [x] 完成 Sprint 0 / 0.12：移除生产启动自动 `MigrateAsync`，改为手动迁移 + pending migrations 启动校验。
- [x] 完成 Sprint 0 / 0.13：EF pending model changes 检查显示无模型变更，本轮无需新增 migration。
- [x] 完成 Sprint 0 / 0.14：删除 `EnsureCreated()` / `EnsureCreatedAsync()` 调用，并补显式 Integration 测试配置种子。
- [x] 完成 Sprint 0 / 0.9：删除 `ReportEndpoints` 默认伪造图表和异常近似统计，改用真实仓储聚合。
- [x] 完成 Sprint 0 / 0.10：修 `eval.ps1` golden 读取与 fail-closed 逻辑。
- [x] 完成 Sprint 0 / 0.11：将 `eval.yml` 移到计划根目录 `.github/workflows/`，并纳入 Evaluation 测试。
- [x] 完成 Sprint 0 / 0.15：新增架构测试，阻断 static 可变字段、Endpoint 随机数、层依赖和仓储读查询缺 `AsNoTracking()`。
- [x] 完成 Sprint 0 / 0.4：`AnomalyAppService.GetOpenAnomaliesAsync` 改用 open 专用仓储分页与计数，避免 resolved 异常混入 open 列表。
- [x] 完成 Sprint 0 / 0.5：`BomAppService.GetAllBomsAsync` 改用仓储级分页/计数，架构测试阻断服务层内存分页回退。
- [x] 完成 Sprint 0 / 0.6：`EmployeeAppService.GetAllAsync` 改用仓储级分页/计数，移除主列表全量加载后内存分页。
- [x] 完成 Sprint 0 / 0.7：确认 `InventoryAppService` 已无 `_transactions` 静态列表，交易读写均经 `IStockTransactionRepository`。
- [x] 完成 Sprint 0 / 0.8：`PurchaseAppService.GetAllAsync` 改用仓储级分页/计数，移除主列表全量加载后内存分页。
- [x] 清理 `npm run lint` 真实扫描出的 196 errors / 4444 warnings，形成 0 warnings 的可执行门禁。

## P1

- [x] 明确 `MES.Tests.Evaluation` 的职责；它现在作为 eval 门禁，已补入可发现测试。
- [x] 决定并处理 `npm run build` / E2E 输出中的 Node deprecation warning：通过 Nuxt alias 收口 `@vue/shared` 解析，当前 build 不再输出 deprecation warning。

## 回归命令

- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-restore`
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-restore`
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~AnomalyControllerTests --no-restore`
- `dotnet test .\src\tests\MES.Tests.Evaluation\MES.Tests.Evaluation.csproj --no-restore`
- `dotnet test .\src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --no-restore`
- `dotnet test .\src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter FullyQualifiedName~ListAppServices_ShouldUseRepositoryPaging --no-restore`
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~BomControllerTests --no-restore`
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter FullyQualifiedName~EmployeeAppServiceTests --no-restore`
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~EmployeeControllerTests --no-restore`
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter FullyQualifiedName~InventoryAppServiceTests --no-restore`
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~InventoryControllerTests --no-restore`
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter FullyQualifiedName~PurchaseAppServiceTests --no-restore`
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~PurchaseControllerTests --no-restore`
- `pwsh .\src\tests\MES.Tests.Evaluation\eval.ps1`
- `npm run lint`
- `npm run build`
- `npm run test:e2e -- --reporter=list`
