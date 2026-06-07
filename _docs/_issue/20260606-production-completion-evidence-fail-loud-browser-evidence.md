# 2026-06-06 ProductionBoard 完工证据失败 Issue

## Issue

`ProductionBoard` 完工证据写入失败路径已有单测，但缺少真实浏览器证据。生产完工是用户必经闭环，证据链失败时不能只靠单测证明，必须确认 Chromium 下不会伪造成功状态。

## Resolution

- 增加真实 Chromium e2e，模拟 `aimes_otd_evidence_chain` 写入失败。
- 断言页面显示 fail-loud 告警，保留完工报告 dialog，不展示成功完工报告，不写入不完整证据链。

## Status

- A 轨：已关闭。
- B 轨发布闸门：未关闭，仍需单独追踪。
