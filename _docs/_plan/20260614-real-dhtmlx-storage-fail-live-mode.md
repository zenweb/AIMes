# 2026-06-14 Plan - 真实 dhtmlx Storage Fail Live Mode

## 成功标准
- `localStorage.getItem('aimes_offline_demo')` 抛错时，真实 dhtmlx 不显示 `.gantt-e2e-markers`。
- 存储读取失败不能让 `ScheduleBoard` 误切演示排产数据。
- Chromium 中必须能看到正式 mock 排产任务 `WO-RUSH-9001`。
- 相关单测、排产 Chromium 全文件、全量 unit coverage 必须通过。

## 执行
1. 用 RED 单测复现 Gantt storage failure 仍显示 marker。
2. 用 RED 单测复现 offline demo 工具读取失败会退回构建默认 demo。
3. 最小修复 Gantt 显式 live 判定和通用 offline demo 工具。
4. 用 Chromium e2e 验证 storage failure 下真实 dhtmlx 任务条仍渲染。
5. 回跑相关单测、scheduling Chromium 全文件、全量 unit coverage。

## 验证结果
- RED 已观察到：Gantt storage failure 单测失败于 marker 仍 visible。
- RED 已观察到：offline demo storage failure 单测失败于返回 true。
- GREEN：`offline-demo-mode.test.ts` 10 passed。
- GREEN：`gantt-chart.test.ts` 19 passed。
- GREEN：`scheduling.spec.ts --project=chromium` 42 passed。
- GREEN：`test:unit:coverage` 105 files / 693 tests passed，lines 83.17%。
