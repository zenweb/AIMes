# Todo：MonitoringBoard 现场态势处置包闭环证据下一步

## 下一片建议

- 若继续监控模块精品化，优先跑完整 `monitoring.spec.ts`，把现场事件流、证据同步、跨模块升级、关闭反写和 fail-loud 路径放在同一模块级回归里确认。
- 若按覆盖率杠杆切换，转向仍低覆盖且用户必经的生产完工、报表 POC 签署、审计回放或质量知识复用关键路径。

## 验证待办

- 资源允许时跑完整 `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts`。
- 后续覆盖率刷新时确认 `MonitoringBoard.vue` 和现场态势同步工具的覆盖率变化。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍属于 B 轨，不能用本轮 Chromium 证据替代。
