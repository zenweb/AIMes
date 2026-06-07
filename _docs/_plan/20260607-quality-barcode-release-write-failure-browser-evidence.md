# 2026-06-07 Plan - 扫码质量门释放写入失败 Chromium 证据

## 成功标准

- 真实 Chromium 中可复现 `aimes_otd_evidence_chain` 写入失败。
- 用户点击 `复验通过并释放交接` 后页面 fail-loud。
- 页面不显示放行成功状态或成功消息。
- 本地证据不写入复验、交接释放、排产回写、标签解冻 4 条释放 trace。
- 定向 e2e 通过。

## 执行

1. 读取现有扫码返工复验放行成功 e2e 和 `QualityBoard` 写入逻辑。
2. 在成功用例旁新增失败态 e2e，复用相同 active 冻结证据。
3. 通过 `Storage.prototype.setItem` 注入 `aimes_otd_evidence_chain` 写入失败。
4. 断言 alert、待放行状态、可重试按钮和无伪造释放 trace。
5. 运行定向 Chromium e2e。

## 验证命令

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "扫码质量门释放写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 非目标

- 不修改产品代码。
- 不扩展扫码质量门新能力。
- 不处理 Hosted CI、PostgreSQL/staging、灰度、安全签字等 B 轨闸门。
