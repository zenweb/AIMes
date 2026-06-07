# 2026-06-06 ScheduleBoard 风险看板读取失败 Next Actions

## 下一步

- 本片已补风险看板读取失败真实浏览器证据；不要继续重复该路径。
- 如继续 `ScheduleBoard`，优先比较：
  - 拖拽保存失败真实浏览器证据。
  - 风险事件增强失败真实浏览器证据，但只有能稳定触发真实请求/真实 UI 才继续。
  - 后端 Agent 建议采纳失败是否还缺更强证据。
- 若 `ScheduleBoard` 边际收益下降，重新比较 `ReportBoard.vue`、`PurchaseBoard.vue`、`AdminBoard.vue` 等低覆盖且用户关键入口。

## B 轨道

- hosted CI release-level run URL/run id/job summary 仍缺；当前 remote 不是 GitHub repo。
- PostgreSQL/staging rehearsal 仍缺。
- Attack Chain A/B/C manual verifier + `VerifiedAt` 仍缺。
- Security signoff、首次灰度、14 天 P0/P1=0 观察窗口仍缺。
