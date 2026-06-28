# 2026-06-20 Agent 配置审批后端残缺记录兜底

## 变更

- `readAgentConfigApprovalsBackendFirst()` 仅允许完整后端审批记录进入默认/本地记录合并。
- 后端记录必须包含标题、回放标题、配置键、变更前后值、原因、责任人、状态、审计 ID、提交人、提交时间与风险说明。
- 质量推荐实验扩大门禁审批还必须包含 `policyArea: quality`、完整 `policyMetrics` 与 `controlSummary`，防止只有 `id/status/decidedAt` 的残缺后端记录把门禁误放宽为 approved。
- 保留本地 override 的 partial 行为；本地审批仍可只记录合法状态与决策人，用于单机演示和人工复核。

## 验证

- RED：新增用例先失败，证明残缺后端 `approved` 会错误放宽质量实验门禁。
- GREEN：`npm run test:unit -- tests/unit/agent-config-approval-sync.test.ts`：11 passed。
- API 合约：`npm run test:unit -- tests/unit/governance-evidence-api.test.ts`：2 passed。
- 过滤相邻：
  - `quality-knowledge-sample-sync.test.ts -t "gray|灰度|approval|审批|质量推荐|gate|门禁"`：11 passed / 19 skipped。
  - `admin-board.test.ts -t "审批|approval|配置|config|质量推荐|gray|灰度"`：14 passed / 18 skipped。
  - `audit-decision-replay-panel.test.ts -t "审批|approval|配置|config|质量推荐|gray|灰度"`：10 passed / 50 skipped。
- Lint：PASS。
- Diff check：PASS，仅 CRLF warning。

## 发布意义

质量推荐实验扩大门禁属于发布证据链的一部分。后端残缺记录不能作为放宽质量阈值的审计证据，否则会产生“门禁已通过但缺少策略指标与控制摘要”的假阳性。
