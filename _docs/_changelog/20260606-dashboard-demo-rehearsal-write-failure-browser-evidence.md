# 2026-06-06 Dashboard Demo 彩排证据写入失败 Chromium 证据

## 变更

- 新增生产概览 e2e：`5 分钟 Demo 彩排证据写入失败时真实浏览器展示 fail-loud 且不伪造证据`。
- 真实 Chromium 中模拟 `aimes_otd_evidence_chain` 写入失败，验证生产运营控制塔显示 `彩排证据写入失败`。
- 验证失败时不显示彩排成功 trace，不写入伪造 `demo-rehearsal-20260521` 证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/dashboard.spec.ts -g "彩排证据写入失败"
```

结果：`1 passed`。
