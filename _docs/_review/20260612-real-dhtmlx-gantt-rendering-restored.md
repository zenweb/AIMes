# Review：真实 dhtmlx 甘特图任务条恢复

## 结论

通过。此次修复聚焦现有排产页真实甘特图渲染链路，没有扩展新功能。

## 审查点

- 根因证据：临时真实浏览器探针显示 `loadData()` 在 10 秒内高频重复执行，且每轮均完成 `clearAll`、`parse`、`render`，说明失败不是 API 未返回或单次 parse 抛错，而是 dhtmlx 写入任务对象后触发 deep watcher 反馈循环。
- 代码边界：生产代码只改 `GanttChart.vue` 的 dhtmlx 入参、root id 和 parse 快照；类型声明只补齐 dhtmlx 入参/root id；e2e 只补真实 dhtmlx 用例与 mock 路由。
- 回归保护：新增单测模拟 dhtmlx 给 parsed task 写 `$rendered_type`，断言不会重复 reload。
- 真实浏览器证据：关闭轻量 marker/offline demo 后，Chromium e2e 已断言 `.gantt_task_line` 中出现 `WO-RUSH-9001`。

## 剩余风险

- 目前真实 dhtmlx e2e 覆盖“后端载荷可渲染任务条”，尚未扩展到真实 dhtmlx 拖拽保存全链路截图。
- 组件仍保留 deep watcher；当前通过传入快照阻断 dhtmlx 反向污染，后续若新增其它第三方写入路径，需要继续按快照边界处理。
