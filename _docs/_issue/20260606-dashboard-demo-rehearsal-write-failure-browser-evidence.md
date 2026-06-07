# Issue: Dashboard Demo 彩排证据写入失败真实浏览器缺口

## 背景

生产运营控制塔的 Demo 彩排确认会写入 OTD 证据链，并被报表中心和审计回放读取。此前已有单元测试覆盖写入失败的 fail-loud 行为，但缺少真实 Chromium 证据证明失败时不会误报彩排已确认。

## 处理

- 新增 Chromium e2e，模拟 `Storage.prototype.setItem` 对 `aimes_otd_evidence_chain` 抛错。
- 验证页面展示 `彩排证据写入失败`。
- 验证成功 trace 不可见、本地不存在 `demo-rehearsal-20260521`。

## 当前状态

已补证据。目标 e2e 通过。
