# ChatPanel 设备停机复核包 OTD 写入失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：`ChatPanel` 生成设备停机复核包后，OTD 复盘证据链写入失败的 fail-loud 行为。
- 目标：真实 Chromium 中模拟 `aimes_otd_evidence_chain` 写入失败，确认动作成果仍对用户可见，同时明确暴露证据写入失败原因。

## 变更

- `src/frontend/tests/e2e/chat.spec.ts`
  - 新增真实 Chromium 用例：`可执行动作：设备停机复核包 OTD 证据写入失败时真实浏览器保留 fail-loud 告警`。
  - 用例通过 `Storage.prototype.setItem` 仅对 `aimes_otd_evidence_chain` 抛错，避免影响登录态和其它本地存储。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/chat.spec.ts -g "设备停机复核包 OTD 证据写入失败"`
- 结果：Nuxt production build passed，Chromium 1/1 passed。

## 覆盖

- 真实 Chromium 触发 ChatPanel 设备停机复核包动作。
- 页面跳转到 `/scheduling/equipment`。
- 状态消息保留：
  - `权限校验通过：Admin 可生成设备停机复核包。`
  - `AUD-CHAT-EQ-DOWNTIME-CNC001-20260523-001`
  - `TRACE-EQ-DOWNTIME-CNC-001`
- 动作卡片仍可见：`CNC-001 设备停机复核包`。
- fail-loud alert 展示：
  - `设备停机复核包已生成，但 OTD 证据写入失败`
  - `chromium equipment downtime evidence storage unavailable`
- 未误报整体动作失败：未出现 `动作执行失败：生成设备停机复核包`。

## 结论

- ChatPanel 设备停机复核包 OTD 写入失败路径现在具备真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
