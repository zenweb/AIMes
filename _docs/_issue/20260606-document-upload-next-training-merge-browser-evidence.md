# 2026-06-06 DocumentUpload 下一训练集合并失败 Issue

## Issue

`DocumentUpload` 下一训练集合并失败已有组件层 fail-loud 行为，但缺真实浏览器证据。该动作位于 R3 审批前，失败时不能生成现场反馈合并历史或合并审计号。

## Resolution

- 增加真实 Chromium e2e。
- 模拟 R3 合并写入失败。
- 断言错误可见、候选状态保留、历史不伪造。

## Status

- A 轨：已关闭。
- B 轨发布闸门：未关闭，仍需单独追踪。
