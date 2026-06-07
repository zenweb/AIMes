# Todo：ProductionBoard 完工排产质量回写证据下一步

## 下一片建议

- 若继续生产模块精品化，优先跑完整 `production.spec.ts`，确认开工、完工、异常上报、风险联动、空状态和进度条在同一模块级回归里共同通过。
- 若按覆盖率杠杆切换，转向仍低覆盖且用户必经的报表 POC 签署、审计回放、质量知识复用或生产开工成功闭环关键路径。

## 验证待办

- 资源允许时跑完整 `npm.cmd run test:e2e -- tests/e2e/production.spec.ts`。
- 后续覆盖率刷新时确认 `ProductionBoard.vue`、`ProductionExecutionTracePanel.vue` 和完工证据同步工具的覆盖率变化。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍属于 B 轨，不能用本轮 Chromium 证据替代。
