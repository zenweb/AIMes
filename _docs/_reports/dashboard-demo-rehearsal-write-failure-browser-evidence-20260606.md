# Dashboard Demo 彩排证据写入失败真实浏览器证据

日期：2026-06-06

## 目标

补齐生产运营控制塔的真实 Chromium 证据：点击 `确认彩排并写入证据链` 后，如果 OTD 证据链写入失败，页面必须 fail-loud，不能显示彩排确认成功，也不能伪造 `demo-rehearsal-20260521` 证据。

## 选片依据

- 当前覆盖率报告显示 `DashboardBoard.vue` 行覆盖率约 76.07%，低于全局 79.26%。
- `/dashboard` 是登录后的生产运营控制塔入口，Demo 彩排证据会进入报表和审计回放，是售前证据链关键路径。
- 既有单元测试已覆盖写入失败 fail-loud；既有 e2e 覆盖成功长链路，但缺失败时“不伪造证据”的真实浏览器证据。

## 本轮变更

- 在 `src/frontend/tests/e2e/dashboard.spec.ts` 新增 `5 分钟 Demo 彩排证据写入失败时真实浏览器展示 fail-loud 且不伪造证据`。
- 本轮未改产品代码：`DashboardBoard.vue` 已有 `handleConfirmDemoRehearsal()` 写入失败处理，本片只补 Chromium 证据。

## GREEN 证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/dashboard.spec.ts -g "彩排证据写入失败"
```

结果：

```text
1 passed
```

验证点：

- Chromium 打开生产概览页。
- 覆盖 `Storage.prototype.setItem`，让 `aimes_otd_evidence_chain` 写入抛出 `dashboard demo rehearsal evidence storage unavailable`。
- 点击 `确认彩排并写入证据链`。
- 页面展示 `彩排证据写入失败`、`5 分钟 Demo 彩排尚未写入 OTD 证据链` 和底层错误。
- `TRACE-DEMO-RUNBOOK-20260521-REHEARSAL` 不可见。
- `localStorage` 中不存在 `demo-rehearsal-20260521`，避免伪造彩排证据。

## 边界

- 本轮只补真实浏览器证据，未扩展新功能。
- 未全量重跑 `dashboard.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
