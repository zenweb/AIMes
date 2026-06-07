# Todo：AnomalyBoard 异常分流写入失败下一步

## 下一片建议

- 继续按覆盖率杠杆选择低覆盖且用户必经组件。
- 当前覆盖率候选中，`ProductionBoard.vue`、`ScheduleBoard.vue`、`DashboardBoard.vue` 仍值得和已有证据对比后再选片。
- 不建议继续反复精修 LoginPage 或已充分覆盖的单一微交互。

## 验证待办

- 资源允许时跑完整 `npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts`。
- 后续覆盖率刷新时确认 `AnomalyBoard.vue` 覆盖率增量。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍属于 B 轨，不能由本片浏览器证据替代。
