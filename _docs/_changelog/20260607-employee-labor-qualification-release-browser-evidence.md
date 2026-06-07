# 2026-06-07 SkillMatrixPanel 停工复核重新放行 Chromium 证据

## 变更

- 复跑人员能力约束 e2e：`停工复核经主管补证改派后重新放行生产与排程`。
- 确认 Nuxt production build + Chromium 下，停工复核可经主管复核、补证改派恢复生产开工、排程约束和报表 OTD 证据。
- 本轮未修改产品代码，只补充真实浏览器证据报告。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "停工复核经主管补证改派后重新放行生产与排程"
```

结果：`1 passed`。
