# 2026-06-06 ScheduleBoard 排产计划 HTML fallback Next Actions

## 下一步

- 本片已补排产计划 HTML fallback 真实浏览器证据；不要继续重复该路径。
- 如继续 `ScheduleBoard`，优先比较：
  - 风险事件增强失败真实浏览器证据。
  - 拖拽保存失败真实浏览器证据。
  - 后端排产优化失败真实浏览器证据。
- 若 `ScheduleBoard` 边际收益下降，重新比较 `ReportBoard.vue`、`PurchaseBoard.vue`、`AdminBoard.vue` 等低覆盖且用户关键入口。

## B 轨道

- hosted CI release-level run URL/run id/job summary 仍缺；当前 remote 不是 GitHub repo。
- PostgreSQL/staging rehearsal 仍缺。
- Attack Chain A/B/C manual verifier + `VerifiedAt` 仍缺。
- Security signoff、首次灰度、14 天 P0/P1=0 观察窗口仍缺。
