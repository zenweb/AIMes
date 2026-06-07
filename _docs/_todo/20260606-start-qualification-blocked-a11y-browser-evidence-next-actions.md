# 2026-06-06 StartQualificationPanel 开工资质阻断语义 Next Actions

## 下一步

- 继续按覆盖率杠杆选择“低覆盖且用户必经”的现有组件，不回到 LoginPage 细碎精修。
- 候选：重新跑 `npm.cmd run test:unit:coverage` 后按最新 `coverage-summary.json` 排序。
- 如果继续生产域，优先补 `StartQualificationPanel` pass/warning 独立语义单测或 `ProductionBoard` 低覆盖关键分支，但必须保持单片可验证。

## 发布 B 轨道

- hosted CI release-level run URL/run id/job summary 仍缺。
- PostgreSQL/staging rehearsal 仍缺。
- Attack Chain A/B/C manual verifier + `VerifiedAt` 仍缺。
- Security signoff、首次灰度、14 天 P0/P1=0 观察窗口仍缺。
