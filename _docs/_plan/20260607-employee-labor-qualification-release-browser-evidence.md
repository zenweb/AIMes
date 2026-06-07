# Plan：SkillMatrixPanel 停工复核重新放行真实浏览器证据

## 成功标准

- Chromium 中打开人员管理页。
- 先生成无有效替班候选的停工复核阻断。
- 主管确认停工复核后，阻断进入复核中。
- 补证改派后，阻断进入重新放行状态。
- 生产页开工弹窗读取放行证据并允许确认。
- 排程页显示人员替班事件。
- 报表页出现人员放行 OTD evidence。

## 执行

1. 读取现有 employee e2e 和上一轮停工复核阻断证据 todo。
2. 选择既有 `停工复核经主管补证改派后重新放行生产与排程` 用例作为本轮真实浏览器证据。
3. 使用 Nuxt production build + Chromium 复跑目标用例。
4. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "停工复核经主管补证改派后重新放行生产与排程"
```

结果：`1 passed`。
