# 2026-06-07 QualityBoard 扫码质量门释放写入失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`扫码质量门释放写入失败时真实浏览器展示 fail-loud 且不伪造放行证据`。
- 用真实 Chromium 模拟 `aimes_otd_evidence_chain` 放行证据写入失败。
- 验证失败时页面保持待放行状态，不显示放行成功消息，不写入复验、交接释放、排产回写、标签解冻 4 条伪造 trace。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "扫码质量门释放写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
