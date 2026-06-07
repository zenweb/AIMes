# 2026-06-06 DocumentUpload 下一训练集灰度发布失败 Next Actions

## 下一步

- 本片已补 R3 下一训练集首次灰度发布失败真实浏览器证据；不要重复该路径。
- 如继续 DocumentUpload，优先补重新灰度发布失败、灰度监控决策写入失败等真实浏览器证据。
- 若 DocumentUpload 边际收益下降，按覆盖率杠杆重新比较 `ReportBoard.vue`、`PurchaseBoard.vue`、`AuditDecisionReplayPanel.vue` 等用户关键入口。

## B 轨道

- hosted CI release-level run URL/run id/job summary 仍缺。
- PostgreSQL/staging rehearsal 仍缺。
- Attack Chain A/B/C manual verifier + `VerifiedAt` 仍缺。
- Security signoff、首次灰度、14 天 P0/P1=0 观察窗口仍缺。
