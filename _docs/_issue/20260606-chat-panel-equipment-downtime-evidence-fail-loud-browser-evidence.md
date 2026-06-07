# 2026-06-06 ChatPanel 设备停机复核包 OTD 写入失败 Issue

## Issue

`ChatPanel` 设备停机复核包 OTD 写入失败路径已有单元覆盖，但缺真实浏览器证据。该动作会影响设备维护、排产、风险和审计链路；证据链写入失败时必须 fail loud，不能让用户误以为发布级证据完整。

## Resolution

- 增加真实 Chromium e2e。
- 仅模拟 `aimes_otd_evidence_chain` 写入失败。
- 断言动作成果仍可见、失败原因可见，且未出现整体动作失败文案。

## Status

- A 轨：已关闭。
- B 轨发布闸门：未关闭，仍需单独追踪。
