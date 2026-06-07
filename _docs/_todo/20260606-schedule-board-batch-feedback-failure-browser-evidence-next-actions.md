# 2026-06-06 ScheduleBoard 批量方案反馈同步失败 Next Actions

## 下一步

- 本片已补批量方案反馈同步失败真实浏览器证据；不要继续重复该路径。
- 如继续 `ScheduleBoard`，优先选择能被当前 e2e 真实触发的路径。
- 拖拽保存失败若要做真实浏览器证据，需要先让 e2e 支持非轻量甘特或提供真实可拖拽事件源，否则不要伪造。
- 若 `ScheduleBoard` 边际收益下降，重新比较 `ReportBoard.vue`、`PurchaseBoard.vue`、`AdminBoard.vue` 等低覆盖且用户关键入口。

## B 轨道

- hosted CI release-level run URL/run id/job summary 仍缺；当前 remote 不是 GitHub repo。
- PostgreSQL/staging rehearsal 仍缺。
- Attack Chain A/B/C manual verifier + `VerifiedAt` 仍缺。
- Security signoff、首次灰度、14 天 P0/P1=0 观察窗口仍缺。
