# 2026-06-07 QualityBoard 扫码返工复验放行 Chromium 证据

## 变更

- 复跑质量闭环 e2e：`扫码返工复验放行进入审计回放和 OTD 复盘`。
- 确认 Nuxt production build + Chromium 下，扫码返工复验放行能进入审计回放和报表 OTD 复盘。
- 本轮未修改产品代码，只补充真实浏览器证据报告。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "扫码返工复验放行进入审计回放和 OTD 复盘"
```

结果：`1 passed`。
