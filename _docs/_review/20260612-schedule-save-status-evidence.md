# 2026-06-12 Review: 排产拖拽保存状态证据

## 审计结论

- 通过。保存成功状态已从隐含状态推进为调度员可见状态，并有 unit、mock E2E、live staging E2E 三层证据。

## 关键检查

- 成功状态只在 `rescheduleItem` 成功后写入。
- 保存失败会清空状态并保留原有 `role="alert"` 错误横幅。
- 刷新/重试排产数据会清空状态，避免旧成功提示覆盖新载荷。
- live staging 仍以真实 dhtmlx、live API PATCH、GET read model、PostgreSQL 同窗作为硬证据。

## 风险

- 时间显示沿用当前排产页既有 ISO 窗口口径，不在本片引入时区策略重构。
- 该证据仍依赖本机 Docker compose API/PostgreSQL 环境，尚未代表 hosted CI 常态运行。

## 复核命令

```powershell
npm run test:unit -- tests/unit/schedule-board.test.ts
npm run test:e2e -- --grep "真实 dhtmlx 拖拽保存"
$env:AIMES_RUN_LIVE_STAGING_E2E='true'
$env:AIMES_LIVE_API_BASE_URL='http://localhost:5002'
npm run test:e2e -- --grep "live staging"
```
