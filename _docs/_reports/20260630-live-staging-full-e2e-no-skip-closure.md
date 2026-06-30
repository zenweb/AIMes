# Live Staging Full E2E No-Skip Closure

日期：2026-06-30

## 范围

- Scheduling 真实 dhtmlx live staging 两条 PostgreSQL/API backed 用例。
- Employee live backend 离线残留恢复用例。
- Full frontend real-browser E2E 在 live 开关打开后无 skipped 收口。

## 环境

- Docker Desktop Server：可访问。
- API 宿主端口：`http://127.0.0.1:5002`。
- Docker Compose API 映射：`0.0.0.0:5002->5003/tcp`。
- PostgreSQL：`postgresql` service，database `mes`。
- API health：`GET http://127.0.0.1:5002/health` 返回 `200 Healthy`。
- PostgreSQL probe：`mes|7`。

## 修复

- `src/frontend/tests/e2e/employee.spec.ts`
  - 新增 `AIMES_LIVE_API_BASE_URL` 支持。
  - Employee live backend 用例只在测试内部转发必要端点：
    - `**/api/v1/auth/login`
    - `**/api/v1/employee**`
  - 不再要求通过全局 `VITE_API_TARGET` 切整套前端代理，避免污染离线 E2E。
- `scripts/run-employee-live-backend-evidence.ps1`
  - 新增 `-ApiBaseUrl` 参数。
  - 改为注入 `AIMES_LIVE_API_BASE_URL`，并清理 `VITE_API_TARGET`，避免证据脚本复现全局代理污染。

## 验证

- `npm run test:e2e -- scheduling-live-staging.spec.ts`
  - 环境：`AIMES_RUN_LIVE_STAGING_E2E=true`，`AIMES_LIVE_API_BASE_URL=http://127.0.0.1:5002`。
  - 2 passed。
- `npm run test:e2e -- tests/e2e/employee.spec.ts -g "employee-live-backend"`
  - 环境：`AIMES_E2E_LIVE_BACKEND=true`，`AIMES_LIVE_API_BASE_URL=http://127.0.0.1:5002`。
  - 1 passed，0 flaky。
- `npm run test:e2e -- tests/e2e/quality.spec.ts -g "质量返工事件回写排产和 OTD 复盘"`
  - 环境：live 开关打开，不设置 `VITE_API_TARGET`。
  - 1 passed。
- `npm run test:e2e`
  - 环境：`AIMES_RUN_LIVE_STAGING_E2E=true`，`AIMES_E2E_LIVE_BACKEND=true`，`AIMES_LIVE_API_BASE_URL=http://127.0.0.1:5002`，不设置 `VITE_API_TARGET`。
  - 390 passed / 0 skipped / 0 failed。
  - 耗时 7.9 分钟。
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-employee-live-backend-evidence.ps1 -ReportPath _docs/_reports/employee-live-backend-evidence-20260630-5002-current.md -ApiBaseUrl http://127.0.0.1:5002`
  - Exit code 0。
  - 产出 `_docs/_reports/employee-live-backend-evidence-20260630-5002-current.md`。
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 ... -DeferGrayObservation`
  - Exit code 0。
  - 产出 `_docs/_reports/release-gate-audit-20260630-live-e2e-no-skip-deferred-gray.md`。
  - Result: `PASS_WITH_DEFERRED_GRAY_OBSERVATION`。

## 证据产物

- `output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-save-status.png`
- `output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-refresh-readback.png`
- `output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-refresh-readback-manifest.md`
- `output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-locked-plan-rejected.png`
- `output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-locked-plan-rejected-manifest.md`
- `_docs/_reports/employee-live-backend-evidence-20260630-5002-current.md`
- `_docs/_reports/release-gate-audit-20260630-live-e2e-no-skip-deferred-gray.md`

## 结论

此前完整前端 E2E 的 3 个 skipped 已收口：2 个 live staging + 1 个 employee live backend 均纳入完整套件并通过。

这证明前端真实浏览器主套件在本地 Docker staging/API/PostgreSQL 条件下已无失败、无跳过。它不等于发布总闸门全部完成；首次灰度和 14 天 P0/P1 观察仍是独立发布轨道。

聚合 release gate 当前为 `PASS_WITH_DEFERRED_GRAY_OBSERVATION`：允许按 owner 决策继续后续工作，但不是 strict v1.0.0 final release PASS。
