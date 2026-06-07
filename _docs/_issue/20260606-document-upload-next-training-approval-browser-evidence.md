# 2026-06-06 DocumentUpload 下一训练集审批失败 Issue

## Issue

`DocumentUpload` 下一训练集审批失败已有组件层 fail-loud 行为，但缺真实浏览器证据。该动作位于质量知识 R3 灰度前强链路，失败时不能生成审批历史或审批审计号。

## Resolution

- 增加真实 Chromium e2e。
- 先真实点击合并现场反馈，使 R3 进入待审批状态。
- 模拟 R3 approval 写入失败。
- 断言错误可见、状态保留、历史不伪造。

## Status

- A 轨：已关闭。
- B 轨发布闸门：未关闭，仍需单独追踪。
