# 2026-06-07 ProductionBoard 完工排产质量回写 Chromium 证据

## 变更

- 复跑生产看板 e2e：`完工后生成排产与质量回写记录`。
- 确认 Nuxt production build + Chromium 下，生产完工能生成排产回写、生产复核、质量联动，并进入排产复核、报表 OTD 证据链和审计回放。
- 本轮未修改产品代码，只补充真实浏览器证据报告。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "完工后生成排产与质量回写记录"
```

结果：`1 passed`。
