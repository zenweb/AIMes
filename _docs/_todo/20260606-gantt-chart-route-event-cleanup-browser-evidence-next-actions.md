# 2026-06-06 GanttChart 路由事件清理 Next Actions

## 下一步

- 继续按覆盖率杠杆选择低覆盖且用户必经的既有组件。
- `GanttChart` 本片已覆盖 dhtmlx 事件清理；除非出现真实路由泄漏或拖拽回调缺陷，不继续做甘特图微切片。
- 下一片建议重新比较 `ProductionBoard.vue`、`ScheduleBoard.vue`、`ChatPanel.vue` 等低覆盖关键路径，并优先选择没有停止精修标记的明确 correctness/reliability 缺口。

## B 轨道

- hosted CI release-level run URL/run id/job summary 仍缺。
- PostgreSQL/staging rehearsal 仍缺，当前 Docker Hub 镜像拉取通道需要环境侧修复或预拉取镜像。
- Attack Chain A/B/C manual verifier + `VerifiedAt` 仍缺。
- Security signoff、首次灰度、14 天 P0/P1=0 观察窗口仍缺。
