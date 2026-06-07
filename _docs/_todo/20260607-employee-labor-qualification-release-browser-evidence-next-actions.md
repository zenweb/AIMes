# Todo：SkillMatrixPanel 停工复核重新放行证据下一步

## 下一片建议

- 人员能力约束三段浏览器证据已覆盖：正向替班、无候选阻断、补证改派重新放行。后续不应继续精修同一链路，除非发现真实缺陷。
- 按覆盖率杠杆转向仍低覆盖且用户必经的生产开工、质量放行、库存出入库或工艺路线关键路径。

## 验证待办

- 资源允许时跑完整 `npm.cmd run test:e2e -- tests/e2e/employee.spec.ts`。
- 后续覆盖率刷新时确认 `SkillMatrixPanel.vue` / `EmployeeBoard.vue` 覆盖率变化。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍属于 B 轨，不能用本轮 Chromium 证据替代。
