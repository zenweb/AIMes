# 2026-06-06 ChatPanel 设备停机复核包 OTD 写入失败 Plan

## Success Criteria

- 真实 Chromium 能触发 ChatPanel 设备停机复核包动作。
- 仅 `aimes_otd_evidence_chain` 写入失败。
- 页面仍展示设备停机复核包已生成状态、审计编号、追踪编号和动作卡片。
- 页面展示 fail-loud 告警和具体错误原因。
- 不误报整体动作失败。
- 不修改生产行为，只补证据。

## Result

- 新增目标 e2e。
- `npm.cmd run test:e2e -- tests/e2e/chat.spec.ts -g "设备停机复核包 OTD 证据写入失败"` 最终 Chromium 1/1 passed。

## Stop Condition

- 本片到真实 Chromium 证据通过即停止，不继续扩大到其它 ChatPanel 微状态。
