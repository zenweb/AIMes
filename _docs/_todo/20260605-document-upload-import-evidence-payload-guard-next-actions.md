# 2026-06-05 Todo - Document Upload Import Evidence Payload Guard Next Actions

## Done

- [x] 用红灯测试锁定客户工单导入证据坏载荷污染 UI 的风险。
- [x] 在 `DocumentUpload.vue` 增加客户工单导入证据运行时守卫。
- [x] 验证目标单测、lint、全量覆盖率。
- [x] 补齐五类文档。

## Next

- [ ] 继续按“低覆盖 + 用户关键路径”选片；短期不要回头精修已 100% 覆盖的 `LoginPage`。
- [ ] 优先观察 `AuditDecisionReplayPanel.vue` 低分支覆盖或 `DocumentUpload.vue` 剩余用户关键分支，选择边际收益更高的一片。
- [ ] 若全量覆盖率再次出现 fork worker 终止超时提示，单独立测试稳定性 issue，避免和业务坏载荷守卫混在一起修。
- [ ] B-track 继续单独追 hosted CI、staging/PostgreSQL rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。
