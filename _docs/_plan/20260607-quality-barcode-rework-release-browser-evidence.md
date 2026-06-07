# Plan：QualityBoard 扫码返工复验放行真实浏览器证据

## 成功标准

- Chromium 中执行扫码返工复验放行路径。
- 质量页生成质量门释放证据。
- 审计页能回放质量放行链路。
- 报表页能展示 OTD 复盘证据。

## 执行

1. 读取现有 quality e2e 和质量证据报告清单。
2. 选择既有 `扫码返工复验放行进入审计回放和 OTD 复盘` 用例作为本轮真实浏览器证据。
3. 使用 Nuxt production build + Chromium 复跑目标用例。
4. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "扫码返工复验放行进入审计回放和 OTD 复盘"
```

结果：`1 passed`。
