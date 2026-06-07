# Todo：RiskBoard 风险 SLA 晨会复核闭环证据下一步

## 下一片建议

- 若继续风险模块精品化，优先跑完整 `risk.spec.ts`，确认展示、转派升级关闭、生产异常风险卡、正常闭环和 fail-loud 路径能共同通过。
- 若按覆盖率杠杆切换，转向仍低覆盖且用户必经的生产完工、报表 POC 签署、监控现场态势闭环或审计回放关键路径。

## 验证待办

- 资源允许时跑完整 `npm.cmd run test:e2e -- tests/e2e/risk.spec.ts`。
- 后续覆盖率刷新时确认 `RiskBoard.vue`、`RiskActionQueuePanel.vue` 和风险 SLA 同步工具的覆盖率变化。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍属于 B 轨，不能用本轮 Chromium 证据替代。
