# 20260619 Gantt Drag Guidance Links Plan

## 成功标准
- 甘特拖拽前有简体中文和英文提示。
- UI 提供排产、审计、报表和帮助入口。
- 甘特任务列表通过无障碍属性关联到提示内容。
- 变更通过目标测试、组件测试、全量覆盖率、lint、build 和真实浏览器验证。

## 执行步骤
1. 写目标失败测试，锁定 `.gantt-drag-guidance`、双语文本、链接和 `aria-describedby`。
2. 在 `GanttChart.vue` 添加最小 UI 和响应式样式。
3. 跑目标测试、甘特组件测试和全量前端验证。
4. 启动生产预览，在真实浏览器检查 DOM 和截图。
5. 更新本片文档。

## 验证结果
- `npm run test:unit -- tests/unit/gantt-chart.test.ts -t "guides schedule drag"`：通过。
- `npm run test:unit -- tests/unit/gantt-chart.test.ts`：30 个测试通过。
- `npm run test:unit:coverage`：111 个文件、1103 个测试通过。
- `npm run lint`：通过。
- `npm run build`：通过。
- 真实浏览器截图：`gantt-drag-guidance-element-real-browser-20260619`。
