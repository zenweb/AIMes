# Plan：SkillMatrixPanel 资质临期替班真实浏览器证据

## 成功标准

- Chromium 中打开人员管理页。
- 点击 `生成替班建议`。
- 页面生成审计编号和 trace。
- 报表页出现人员替班 OTD evidence。
- 审计页出现人员替班回放。
- 回放详情解释临期资质、候选评分、替班人员、复核和排产释放窗口。

## 执行

1. 读取现有 employee e2e 和人员能力约束相邻证据。
2. 选择既有 `资质临期生成替班建议` 用例作为本轮真实浏览器证据。
3. 使用 Nuxt production build + Chromium 复跑目标用例。
4. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "资质临期生成替班建议"
```

结果：`1 passed`。
