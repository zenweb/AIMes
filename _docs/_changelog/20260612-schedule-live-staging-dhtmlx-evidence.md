# 2026-06-12 排产 live staging 真实 dhtmlx 证据

## 变更

- 新增 gated E2E：`src/frontend/tests/e2e/scheduling-live-staging.spec.ts`。
- `src/frontend/scripts/e2e.mjs` 将 `live staging` grep 归入真实 dhtmlx 目标，自动关闭 offline demo 和轻量 marker。
- live E2E 会在 PostgreSQL 中 seed 临时排产计划、工单、设备、临时管理员，浏览器登录后用真实 Nuxt 页面拖拽真实 dhtmlx 任务条。
- 验证链路覆盖：真实 API PATCH、点击刷新、GET read model 读回、PostgreSQL 存储窗口一致。

## 证据

- `AIMES_RUN_LIVE_STAGING_E2E=true AIMES_LIVE_API_BASE_URL=http://localhost:5000 npm run test:e2e -- --grep "live staging"`：1 passed。
- `npm run test:e2e -- --grep "真实 dhtmlx"`：4 passed, 1 skipped。
- 证据文件：`output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-refresh-readback-manifest.md`。
- 截图：`output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-refresh-readback.png`。

## 结果

- 排产拖拽保存已从 mock 真实 dhtmlx 证据推进到 live staging 真实 API/PostgreSQL 证据。
- 本片没有扩大功能范围，只补足现有排产关键路径的真实浏览器证据。
