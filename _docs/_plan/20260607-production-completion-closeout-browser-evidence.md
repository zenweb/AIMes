# Plan：ProductionBoard 完工排产质量回写真实浏览器证据

## 成功标准

- Chromium 中打开生产看板。
- 工单可触发完工报告并确认。
- 执行追踪展示排产回写、生产复核和质量联动。
- 排产页能显示生产完工复核事件和建议。
- 报表页 OTD 证据链能展示完工回写。
- 审计页能展示生产完工与生产复核回放，并回放决策链。

## 执行

1. 读取现有生产 e2e 和已有生产证据文档。
2. 选择既有 `完工后生成排产与质量回写记录` 用例作为本轮真实浏览器证据。
3. 使用 Nuxt production build + Chromium 复跑目标用例。
4. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "完工后生成排产与质量回写记录"
```

结果：`1 passed`。
