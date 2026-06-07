# 2026-06-06 DocumentUpload 下一训练集重新灰度发布失败 Next Actions

## 下一步

- 本片已补 R3 重新灰度发布失败真实浏览器证据；不要重复该路径。
- 如继续 DocumentUpload / Admin 质量治理链，优先补灰度监控扩大/回滚决策写入失败真实浏览器证据。
- 若 DocumentUpload 边际收益下降，按覆盖率杠杆重新比较 `ReportBoard.vue`、`PurchaseBoard.vue`、`AuditDecisionReplayPanel.vue` 等用户关键入口。

## B 轨道

- hosted CI release-level run URL/run id/job summary 仍缺。
- PostgreSQL/staging rehearsal 仍缺。
- Attack Chain A/B/C manual verifier + `VerifiedAt` 仍缺。
- Security signoff、首次灰度、14 天 P0/P1=0 观察窗口仍缺。
