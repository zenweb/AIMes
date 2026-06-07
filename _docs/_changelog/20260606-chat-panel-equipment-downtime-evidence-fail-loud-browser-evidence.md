# 2026-06-06 ChatPanel 设备停机复核包 OTD 写入失败真实浏览器证据

## Changed

- `chat.spec.ts` 新增真实 Chromium 用例，覆盖设备停机复核包生成后 OTD 复盘证据链写入失败的 fail-loud 告警。
- 用例确认动作成果仍可见、错误原因对用户可见，并且不会误报为整体动作执行失败。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/chat.spec.ts -g "设备停机复核包 OTD 证据写入失败"` -> Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

本次只关闭 A 轨 ChatPanel 设备停机复核包 OTD 写入失败真实浏览器证据缺口，不关闭 v1.0.0 B 轨发布闸门。
