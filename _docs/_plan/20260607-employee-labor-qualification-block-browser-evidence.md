# Plan：SkillMatrixPanel 停工复核阻断真实浏览器证据

## 成功标准

- Chromium 中打开人员管理页。
- 模拟员工数据中无有效替班候选。
- 点击 `生成替班建议` 后不生成替班记录。
- 页面生成停工复核审计编号和 trace。
- 报表页出现人员阻断 OTD evidence。
- 审计页出现人员阻断回放。
- 回放详情解释阻断原因、复核授权、阻断工序和重新放行条件。

## 执行

1. 读取现有 employee e2e 和上一轮人员替班证据 todo。
2. 选择既有 `无有效替班候选时生成停工复核阻断` 用例作为本轮真实浏览器证据。
3. 使用 Nuxt production build + Chromium 复跑目标用例。
4. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "无有效替班候选时生成停工复核阻断"
```

结果：`1 passed`。
