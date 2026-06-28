# 2026-06-14 Todo - MainLayout 壳层下一步

## Done
- 补暗色模式恢复与持久化测试。
- 补退出登录清理和跳转测试。
- 跑通 `main-layout.test.ts`。
- 跑通完整 `test:unit:coverage`。

## Next
- 继续按覆盖率杠杆选择下一片：优先低覆盖且用户必经组件。
- 当前候选可考虑 `GanttChart`、`AuditDecisionReplayPanel`、`AnomalyBoard`，但不要重复精修已高收益闭环的同一分支。
- 灰度观察仍单独后置，不混入当前测试切片。
