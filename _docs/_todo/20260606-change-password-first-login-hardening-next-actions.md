# 首登强制改密精品化下一步

- [x] 用 coverage 证据选择 `ChangePasswordPage.vue`，避免继续精修已 100% 的 `LoginPage.vue`。
- [x] 补齐首登强制改密失败恢复单测。
- [x] 修复后端拒绝改密时 disabled 输入框无法回焦的问题。
- [x] 跑通定向 unit、lint、真实 Chromium login e2e、全量 unit coverage。
- [ ] 后续按覆盖率和用户必经程度继续选择下一片，候选包括 `AnomalyBoard.vue`、`AuditDecisionReplayPanel.vue`、`ChatPanel.vue`、`ScheduleBoard.vue`。
- [ ] B 轨发布闸门继续单独追踪，不能用本轮 A 轨覆盖率提升替代。
