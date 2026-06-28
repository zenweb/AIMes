# 20260619 Gantt Drag Guidance Links

## 变更
- 在甘特图拖拽区域新增排产拖拽前提示，覆盖简体中文和英文。
- 增加相关入口：AI 排产、审计回放、报表证据、帮助。
- 将轻量甘特任务列表通过 `aria-describedby="gantt-drag-help"` 关联到拖拽提示。

## 验证
- `npm run test:unit -- tests/unit/gantt-chart.test.ts -t "guides schedule drag"`：通过。
- `npm run test:unit -- tests/unit/gantt-chart.test.ts`：30 个测试通过。
- `npm run test:unit:coverage`：111 个文件、1103 个测试通过。
- `npm run lint`：通过。
- `npm run build`：通过。
- 真实浏览器证据：`gantt-drag-guidance-element-real-browser-20260619`。

## 备注
- 本片只补拖拽操作前的可见提示和帮助链接，未调整 dhtmlx 拖拽、冲突判断或写回逻辑。
