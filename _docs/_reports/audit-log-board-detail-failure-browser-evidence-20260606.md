# AuditLogBoard 审计日志详情失败真实浏览器证据

日期：2026-06-06

## 目标

补齐审计日志本体详情的 fail-loud 证据：列表已加载、用户点击某条审计日志详情后，如果 `/api/v1/audit-logs/{id}` 读取失败，页面必须明确告警，并且不能打开空详情弹窗。

## 选片依据

- 当前覆盖率报告显示 `AuditLogBoard.vue` 行覆盖率约 76.92%，低于全局 79.26%。
- 审计日志详情是合规复核、安全签字和业务落库追溯的关键入口。
- 列表失败已补齐真实浏览器证据，本片单独锁定详情接口失败后的弹窗状态一致性。

## 本轮变更

- `src/frontend/src/components/auditLog/AuditLogBoard.vue`
  - 详情读取失败时将 `detail` 置空。
  - 详情读取失败时显示 `审计日志详情加载失败，未打开详情：...`。
  - 复用 `role="alert"` / `aria-live="assertive"` 的 `.audit-list-alert` 告警区。
- `src/frontend/tests/unit/audit-log-board.test.ts`
  - 覆盖详情读取失败不打开弹窗并告警。
- `src/frontend/tests/e2e/audit.spec.ts`
  - 新增真实 Chromium 用例：`审计日志详情接口失败时真实浏览器不打开空弹窗并告警`。

## GREEN 证据

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts
```

结果：`1 passed / 3 tests passed`。

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "审计日志详情接口失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- Chromium 拦截 `/api/v1/audit-logs/audit-board-detail-fail` 返回 503。
- 页面列表仍显示可点击的审计日志行。
- 点击详情按钮后 `.audit-list-alert` 可见。
- 告警包含 `审计日志详情加载失败` 和 `audit detail unavailable from board chromium`。
- `.detail-modal` 保持隐藏，不打开空详情弹窗。
- 用 `detailRequests > 0` 确认真浏览器命中过详情 API。

## 边界

- 未全量重跑 `audit.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
