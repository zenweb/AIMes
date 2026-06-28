# 20260619 Gantt Drag Guidance Links Next Actions

## 已完成
- 甘特拖拽前提示：简体中文 + English。
- 关联链接：AI 排产、审计回放、报表证据、帮助。
- 单测覆盖：提示文本、链接、`aria-describedby`。
- 真实浏览器证据：`gantt-drag-guidance-element-real-browser-20260619`。

## 下一步建议
- 不要继续为 Gantt 残余覆盖率做纯 UI 打磨；除非发现真实拖拽保存、冲突判断、锁定期、dhtmlx 生命周期或浏览器渲染问题。
- 下一片继续按用户关键路径和覆盖率杠杆筛选，可重新比较 `DocumentUpload.vue`、`AdminBoard.vue`、`ScheduleBoard.vue`、`RiskActionQueuePanel.vue` 等候选。

## 非本片范围
- 未调整拖拽写回 API。
- 未调整 dhtmlx 初始化或事件清理。
- 未关闭灰度观察发布门。
