# 2026-05-19 Sprint A — OTD 影响分析面板

## 触发

按 `_docs/_plan/20260519-function-deepening-brainstorm.md` 推进整个项目，优先执行 Sprint A“排产可讲数字”。

## 产出

- 新增 `src/frontend/src/components/schedule/ScheduleImpactPanel.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/tests/e2e/scheduling.spec.ts`
- 更新 `src/frontend/playwright.config.ts`

## 功能

- 在 AI 排产页新增“基线 vs Agent 方案”影响分析面板。
- 展示人工基线与 Agent 推荐的：
  - OTD
  - 延期订单数
  - 延期减少
  - 换线变化
  - 利用率变化
  - 推荐理由
- demo fallback 数据可显示 `OTD +14%`，将排产页从“能看甘特图”推进到“能讲业务改善数字”。

## 验证

- `node ./node_modules/nuxt/bin/nuxt.mjs build`：通过。
- Playwright 页面探针确认：
  - `.impact-panel` 渲染。
  - 文案包含 `OTD +14%`、`人工基线 82%`、`Agent 推荐 96%`。
  - 甘特任务线数量为 3。
- `node node_modules/@playwright/test/cli.js test tests/e2e/scheduling.spec.ts --reporter=list --workers=1 --retries=0`：10 passed。
- `node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`：69 passed。

## 工具链调整

Playwright `webServer.command` 改为直接调用本地 Nuxt 和 preview 脚本：

```text
node ./node_modules/nuxt/bin/nuxt.mjs build && node ./scripts/preview.mjs
```

并通过 `webServer.env` 注入 `VITE_SHOW_DEMO_HINTS=true`，减少本机 Node/NPM 混用导致的 e2e 启动不稳定。

## 下一步

继续 Sprint A-3：插单影响分析。

