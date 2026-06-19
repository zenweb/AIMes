# 2026-06-20 Review - Hosted CI Current Head Repair

## Findings
- 当前远端 `9de95ea` 的 CI/Agent Evaluation 失败是可复现硬失败：
  - 后端/评估：`Program.cs(251,30)` RabbitMQ health check overload 与当前包签名不匹配。
  - 前端：GitHub `npm@10.9.8 ci` 要求 `@emnapi/core@1.11.1` 与 `@emnapi/runtime@1.11.1` 出现在 lockfile。
- 本地 Windows 默认 `npm@11` 不能证明 GitHub `npm@10.9.8`，因此改用同版 npm 复现和验证。
- RabbitMQ health check 修复保持从 `MessagingOptions` 读取连接，符合现有架构测试约束。

## Residual Risk
- 必须推送后观察新的 GitHub Actions run；本地验证不能替代 hosted CI 绿灯。
