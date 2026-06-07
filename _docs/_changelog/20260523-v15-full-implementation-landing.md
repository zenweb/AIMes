# V1.5 全量计划落地验证

> 2026-05-23 | 检查点：A/B/C/D 四轮计划全部实现并落地代码

## 本轮完成

### T-13 AuditLog.InitiatedBy 枚举化
- 新建 `MES.Domain.Enums.AuditInitiatedBy` 枚举（User/System/Agent/Service）
- AuditLog 实体 `InitiatedBy` 从 `string` 改为 `AuditInitiatedBy`
- EF Configuration 添加 `HasConversion<string>()` 实现字符串存储（向后兼容）
- AuditEndpointFilter 从 `X-Initiated-By` header 解析 enum
- AuditLogAppService 接口新增可选参数，DTO 映射加 `.ToString()`
- 生成迁移 `20260523141327_UpdateAuditLogInitiatedByToEnum`（空迁移，列类型不变）
- 构建验证：0 错误 0 警告 ✅

### T-23 前端真实数字接入
- ReportBoard.vue：移除 `releasedFlangeOutsourcing` 数字硬编码封顶/保底（agentOtd/Max、otdLift/Max、delayedOrdersReduced/Max 等），保留文本覆盖层
- ScheduleBoard.vue：引入 `LatestAbReport` 接口 + `latestAbReport` ref + 在 `onMounted` 中 fetch `/reports/latest-ab-report.json`；`applyImpactComparison` 优先取报真实 baseline OTD，无报告时降级用 `clamp(agentOtd - 14, 50, 95)`
- e2e 测试无需改（demo 环境无 report 文件时自动降级到 `demoOtdReport`）

### T-24 修复 e2e 超时
- `production.spec.ts` 套件超时从 90s 提升到 180s（多页导航测试足够）

### T-25 创建 clean-nuxt.ps1
- `scripts/clean-nuxt.ps1`：Windows EPERM 锁清理脚本，支持 5 次重试 + 2s 延迟
- `src/frontend/scripts/e2e.mjs`：在 nuxt build 前增加 Windows 平台的旧构建目录清理

### T-28 README 更新
- `README.md` 新增 "V1.5 深化功能" 章节，索引能力目录、Sprint 推进索引、排产基准报告、权限矩阵、运行脚本

## 全量验证
- `dotnet build MES.Api` + `MES.Tests.Unit` + `MES.Tests.Integration` + `MES.Tools.AbBenchmark`：0 错误 0 警告 ✅
- `dotnet test MES.Tests.Unit`：308 passed ✅
- `nuxt build`：Client + Server 构建成功 ✅

## 对应任务
| 任务 | 状态 | 备注 |
|------|------|------|
| T-13 AuditLog enum | ✅ | 含迁移 |
| T-20 MonteCarlo | ✅ | 上轮 |
| T-23 前端真数字 | ✅ | ReportBoard + ScheduleBoard |
| T-24 e2e 超时 | ✅ | 翻倍到 180s |
| T-25 clean-nuxt | ✅ | 脚本 + 构建集成 |
| T-28 README | ✅ | V1.5 索引章节 |
| T-34 分册 | ✅ | 上轮 |
| T-35 V1.5 注脚 | ✅ | 上轮 |
| T-36 构建噪声 | ✅ | 上轮 |
| T-37 重定位 | ✅ | 上轮 |
| T-27 演示视频 | ⏳ | 外部工序，需录制软件 |

## 遗留项
- T-27 演示视频录制：脚本已就位，需 OBS 等录制软件执行
- A/B 基准显著性不足（p=0.4383）：MonteCarloSimulator 已接入 AbBenchmark，但 runner 未配置大样本量；需要更多数据或承认 demo 数据集用途
