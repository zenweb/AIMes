# 2026-05-20 Agent 关键配置审批闭环

## 变更

- 新增 `agent-config-approval-sync.ts`，把 Agent 关键配置变更从静态展示改为可读写审批记录。
- `系统管理` Agent 治理页支持对 `Scheduling.LockWindowHours 8h -> 10h` 和 `Agent 自动建议置信度阈值 0.72 -> 0.80` 执行通过/驳回。
- 审批结果会写入本地审计记录，`审计日志` AI 决策回放读取同一份记录生成动态 `配置审批` 卡。
- `审计日志` 回放链展示配置提交、审批责任人、业务原因、审批结果和 Agent 策略生效/保留状态。
- 移除锁定期审批的静态重复回放卡，避免同一配置审批在审计面出现两套证据口径。

## 验证

- `npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts`：8 passed。
