# SkillMatrixPanel 人员证据同步写入失败真实浏览器证据

日期：2026-06-06

## 目标

补齐人员技能矩阵的真实 Chromium fail-loud 证据：同步人员证据写入 OTD 证据链失败时，页面必须告警，不能显示同步成功，也不能在本地伪造人员能力证据。

## 选片依据

- 当前覆盖率报告显示 `SkillMatrixPanel.vue` 行覆盖率约 72.83%，低于全局 79.26%。
- 人员技能、资质有效期和排班可用性会影响生产开工、替班、停工复核、报表和审计回放，是用户关键路径。
- 既有单元测试已覆盖同步写入失败的告警，但真实浏览器证据只覆盖成功同步长链路，缺少失败时不伪造 OTD 证据的 Chromium 证据。

## 本轮变更

- 在 `src/frontend/tests/e2e/employee.spec.ts` 新增 `人员证据同步写入失败时真实浏览器展示 fail-loud 且不伪造 OTD 证据`。
- 本轮未改产品代码：`SkillMatrixPanel.vue` 已有 `try/catch` fail-loud 行为，本片只补真实浏览器证据。

## GREEN 证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "人员证据同步写入失败"
```

结果：

```text
1 passed
```

验证点：

- Chromium 打开人员管理页。
- 覆盖 `Storage.prototype.setItem`，让 `aimes_otd_evidence_chain` 写入抛出 `otd evidence storage unavailable`。
- 点击 `同步人员证据`。
- `.skill-matrix-panel` 内 `role="alert"` 展示 `人员证据同步失败` 和底层错误。
- 页面不显示 `人员能力证据已同步 OTD 复盘`。
- `localStorage.getItem('aimes_otd_evidence_chain')` 仍为 `null`，避免伪造 OTD 证据。

## 边界

- 本轮只补真实浏览器证据，未扩展新功能。
- 未全量重跑 `employee.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
