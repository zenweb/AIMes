# Todo：ScheduleBoard 急单插单多方案决策包证据下一步

## 下一片建议

- 若继续排产精品化，优先补急单插单反馈同步失败的 Chromium fail-loud 证据，验证失败时保留当前甘特图和本地目标切换，不伪造已同步状态。
- 若按覆盖率杠杆切换，转向仍低覆盖且用户必经的生产开工、质量知识复用、报表复盘或审计回放关键路径。

## 验证待办

- 资源允许时跑完整 `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts`。
- 后续覆盖率刷新时确认 `ScheduleBoard.vue`、`ScheduleEventQueuePanel.vue`、`ScheduleFeedbackPanel.vue` 覆盖率变化，避免排产页局部微切片长期占用 A 轨。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍属于 B 轨，不能用本轮 Chromium 证据替代。
