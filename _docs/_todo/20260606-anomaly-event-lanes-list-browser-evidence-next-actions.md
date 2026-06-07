# 2026-06-06 AnomalyBoard 现场事件分流队列语义 Next Actions

## 下一步

- 继续按覆盖率杠杆选择低覆盖且用户必经的既有组件。
- 若继续异常域，可审计响应记录列表和 AI 分析建议卡片是否需要 list/listitem 或 status 语义。
- 若异常域边际收益下降，转向当前覆盖率更低的 ChatPanel、EmployeeBoard 或 InventoryBoard 关键路径。

## 发布 B 轨道

- hosted CI release-level run URL/run id/job summary 仍缺。
- PostgreSQL/staging rehearsal 仍缺，当前 Docker Hub HTTPS 拉取失败。
- Attack Chain A/B/C manual verifier + `VerifiedAt` 仍缺。
- Security signoff、首次灰度、14 天 P0/P1=0 观察窗口仍缺。
