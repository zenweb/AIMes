# 2026-06-05 Issue - Audit Replay Assistant Payload Guard

## Issue

审计回放面板依赖多个 backend-first 审计证据来源。助手动作审计接口若返回非数组载荷，必须 fail loud，同时保留基础回放卡，避免审计页面看起来像“没有证据”。

## Risk

- 坏载荷如果静默吞掉，会掩盖真实审计证据同步失败。
- 审计页是 v1 合规主链路，不能让用户误判为审计链路正常但无记录。

## Resolution

- 新增助手动作审计非数组载荷回归测试。
- 断言基础 replay cards 仍可见。
- 断言 assertive alert 包含具体坏载荷原因。

## Status

- A-track：已完成并验证。
- B-track：未关闭；仍需 hosted CI、staging、攻击链、安全签字、灰度与 14 天观察证据。
