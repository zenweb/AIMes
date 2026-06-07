# 2026-06-07 SkillMatrixPanel 资质临期替班 Chromium 证据

## 变更

- 复跑人员能力约束 e2e：`资质临期生成替班建议并进入报表与审计回放`。
- 确认 Nuxt production build + Chromium 下，资质临期替班建议能贯通人员页、报表 OTD 证据链和审计回放。
- 本轮未修改产品代码，只补充真实浏览器证据报告。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "资质临期生成替班建议"
```

结果：`1 passed`。
