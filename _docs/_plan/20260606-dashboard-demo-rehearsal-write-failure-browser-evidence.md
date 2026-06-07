# Plan: Dashboard Demo 彩排证据写入失败浏览器证据

## 成功标准

- 真实 Chromium 中点击 `确认彩排并写入证据链`。
- `aimes_otd_evidence_chain` 写入失败时显示 fail-loud 告警。
- 不显示 `TRACE-DEMO-RUNBOOK-20260521-REHEARSAL` 成功 trace。
- 不伪造本地 `demo-rehearsal-20260521` 彩排证据。

## 执行

- 选片：`DashboardBoard.vue` 行覆盖率约 76.07%，且 `/dashboard` 是生产运营控制塔与售前证据链入口。
- 范围：只新增 e2e，不改产品代码。
- 放弃项：不继续重复 Dashboard 已有的 A/B 报告读取失败、生产概览数据读取失败路径。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/dashboard.spec.ts -g "彩排证据写入失败"
```

结果：`1 passed`。
