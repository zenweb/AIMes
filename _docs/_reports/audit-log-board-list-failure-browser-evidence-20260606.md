# AuditLogBoard 审计日志列表失败真实浏览器证据

日期：2026-06-06

## 目标

补齐审计日志本体列表的 fail-loud 证据：`/api/v1/audit-logs` 读取失败时，页面可以保留本地演示日志维持可用，但必须明确告警，不能让管理员误以为当前表格是真实后端审计日志。

## 选片依据

- 当前覆盖率报告显示 `AuditLogBoard.vue` 行覆盖率约 76.92%，低于全局 79.26%。
- 审计日志是合规、安全签字和业务落库复核入口。
- 既有真实浏览器证据大量覆盖 `AuditDecisionReplayPanel`，但 `AuditLogBoard` 表格本体列表失败此前静默 fallback。

## 本轮变更

- `src/frontend/src/components/auditLog/AuditLogBoard.vue`
  - 新增 `loadError`。
  - 审计日志列表读取失败时显示 `role="alert"` / `aria-live="assertive"` 告警。
  - 仍保留本地演示日志，但文案明确 `已显示本地演示日志`。
  - 审计日志详情读取失败时不打开详情弹窗，并显示失败原因。
- `src/frontend/tests/unit/audit-log-board.test.ts`
  - 覆盖列表读取失败 fallback 告警。
  - 覆盖详情读取失败不打开弹窗并告警。
- `src/frontend/tests/e2e/audit.spec.ts`
  - 新增真实 Chromium 用例：`审计日志列表接口失败时真实浏览器展示本地演示日志 fail-loud`。

## GREEN 证据

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts
```

结果：`1 passed / 3 tests passed`。

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "审计日志列表接口失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- Chromium 拦截 `/api/v1/audit-logs` 返回 503。
- `.audit-list-alert` 可见。
- 告警包含 `审计日志列表加载失败`、`已显示本地演示日志` 和 `audit list unavailable from chromium`。
- 表格仍显示本地演示日志 `operator1` / `Production`。
- 用请求计数确认真实浏览器命中过审计日志 API。

## 边界

- 未全量重跑 `audit.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
