# 2026-06-20 Plan - Hosted CI Current Head Repair

## Success Criteria
- 当前 `V1` head 的 backend job 不再因 RabbitMQ health check 编译失败。
- 当前 `V1` head 的 frontend job 不再因 `npm ci` lockfile 不同步失败。
- Agent Evaluation build 不再命中相同 `Program.cs` 编译错误。

## Steps
1. 拉取 GitHub Actions 失败 job 日志，确认真实失败点。
2. 用本地命令复现/验证后端编译。
3. 用 GitHub 同版 `npm@10.9.8` 复现并修复 lockfile。
4. 精确提交相关文件，推送后观察 hosted CI。

## Current Result
- 本地验证已通过；hosted CI 需在推送后继续观察。
