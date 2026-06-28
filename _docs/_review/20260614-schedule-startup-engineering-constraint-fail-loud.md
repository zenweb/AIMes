# 2026-06-14 Review - 排产启动工程约束 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 启动工程约束读取失败不再阻断正式排产主数据，符合精品级现有功能约束。
- 不声明 `scheduling.spec.ts` 全文件通过；真实 dhtmlx 残留失败已暴露。

## 关注点
- `ScheduleBoard.vue` 当前只对启动阶段的 BOM/ECN 与工艺能力约束做聚合 fail-loud。
- 全量 scheduling Chromium 仍有 4 个既有 dhtmlx 失败，下一片应优先定位 `.gantt-e2e-markers` 为何残留。
- 本轮不扩大功能范围，只硬化现有排产启动可用性。

## 已验证
- 排产单测 27 passed。
- focused Chromium 真实浏览器 1 passed。
- 前端全量 unit coverage 105 files / 684 tests passed。

## 未通过项
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：35 passed，4 failed。
