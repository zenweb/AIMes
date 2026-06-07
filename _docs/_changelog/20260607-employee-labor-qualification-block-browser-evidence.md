# 2026-06-07 SkillMatrixPanel 停工复核阻断 Chromium 证据

## 变更

- 复跑人员能力约束 e2e：`无有效替班候选时生成停工复核阻断`。
- 确认 Nuxt production build + Chromium 下，无有效替班候选不会伪造替班建议，而是生成停工复核阻断，并贯通报表 OTD 证据链和审计回放。
- 本轮未修改产品代码，只补充真实浏览器证据报告。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "无有效替班候选时生成停工复核阻断"
```

结果：`1 passed`。
