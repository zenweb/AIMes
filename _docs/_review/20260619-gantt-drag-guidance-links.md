# 20260619 Gantt Drag Guidance Links Review

## 范围
- 文件：`src/frontend/src/components/gantt/GanttChart.vue`
- 测试：`src/frontend/tests/unit/gantt-chart.test.ts`

## 评审结论
- 甘特拖拽会影响排产窗口、设备冲突、工序依赖和写回证据，是用户关键路径中的复杂操作。
- 当前已在甘特区域增加中英双语拖拽前提示。
- 相关证据入口已链接到排产、审计回放、报表证据和帮助锚点。
- 轻量任务列表已通过 `aria-describedby` 关联帮助说明。

## 风险
- 链接使用普通 `a href`，与该组件现有无 router 依赖的写法一致。真实应用在 `baseURL` 下会按浏览器路径解析。
- 本片不改变拖拽保存、冲突检测、锁定期阻止逻辑。

## 验证
- RED 已确认缺少 `.gantt-drag-guidance` 时目标测试失败。
- GREEN 后目标测试、甘特组件测试、全量覆盖率、lint、build 均通过。
- 已取得真实浏览器元素截图：`gantt-drag-guidance-element-real-browser-20260619`。
