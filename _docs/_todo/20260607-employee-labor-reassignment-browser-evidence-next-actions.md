# Todo：SkillMatrixPanel 资质临期替班证据下一步

## 下一片建议

- 若继续人员能力精品化，优先补 `无有效替班候选时生成停工复核阻断` 的 Chromium 报告，验证阻断进入报表和审计。
- 再补 `停工复核经主管补证改派后重新放行生产与排程`，确认人员阻断可恢复且生产开工读取放行证据。

## 验证待办

- 资源允许时跑完整 `npm.cmd run test:e2e -- tests/e2e/employee.spec.ts`。
- 后续覆盖率刷新时确认 `SkillMatrixPanel.vue` / `EmployeeBoard.vue` 覆盖率变化，避免低收益微切片长期占用 A 轨。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍属于 B 轨，不能用本轮 Chromium 证据替代。
