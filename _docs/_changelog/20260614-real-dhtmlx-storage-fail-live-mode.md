# 2026-06-14 真实 dhtmlx Storage Fail Live Mode

## 变更
- `offline-demo-mode.ts` 对 `localStorage` 读写异常增加保护。
- 读取 `aimes_offline_demo` 失败时默认进入 live mode，避免把存储异常误判为离线演示并短路后端 mock/真实数据路径。
- URL `offlineDemo=false` / `demoMode=false` 写入存储失败时仍保留当前请求的 live 语义。
- `GanttChart.vue` 的显式 live mode 在读取离线演示存储失败时同样优先真实 dhtmlx 渲染。
- 新增 unit 与 Chromium e2e 覆盖“离线演示存储不可读但真实 dhtmlx 仍渲染任务条”。

## 验证
- RED：`npm run test:unit -- tests/unit/gantt-chart.test.ts -t "offline demo storage"` 曾失败于 `.gantt-e2e-markers` 仍 visible。
- RED：`npm run test:unit -- tests/unit/offline-demo-mode.test.ts -t "storage cannot"` 曾失败于存储读取异常后退回 `VITE_OFFLINE_DEMO=true`。
- GREEN：`npm run test:unit -- tests/unit/offline-demo-mode.test.ts`，10 passed。
- GREEN：`npm run test:unit -- tests/unit/gantt-chart.test.ts`，19 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，42 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 693 tests passed，lines 83.17%，`GanttChart.vue` lines 76.25%，`offline-demo-mode.ts` lines 100%。

## 备注
- 15 天灰度观察已按 owner 指令跳过/延期，不作为当前工作阻塞项。
- 本轮只硬化既有排产真实浏览器证据路径，没有新增业务范围。
