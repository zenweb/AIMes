# 2026-05-20 P3 — 审计决策回放

## 触发

深化计划中 P3 “审计”要求 AI 建议、人工采纳、重排动作全部可回放，关键配置变更走审批。当前 `审计日志` 页面只有通用日志列表和详情，缺少面向 AI MES 决策链的业务证据视图。

## 产出

- 新增 `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
- 更新 `src/frontend/src/components/auditLog/AuditLogBoard.vue`
- 新增 `src/frontend/tests/e2e/audit.spec.ts`
- 更新 `src/frontend/tests/e2e/modules.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 审计日志页新增“AI 决策审计”回放面板。
- 支持展示 AI 建议、人工采纳、重排动作和配置审批四类证据。
- demo 决策链覆盖：
  - `WO-RUSH-9001 急单插入重排建议`：风险队列、Agent 建议、调度员采纳原因、OTD 复盘归档。
  - `M-AL-6061 收货后释放冻结工序`：采购加急收货、风险下降、排产复核。
  - `锁定期保护从 8 小时调整为 10 小时`：关键排产配置变更待审批。
- 新增关键配置变更审批队列，覆盖锁定期保护和 Agent 置信度阈值。

## 验证

- 通过：`node ./node_modules/nuxt/bin/nuxt.mjs build`
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/audit.spec.ts --reporter=list --workers=1 --retries=0`，2 passed。
- 通过：`node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`，96 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

继续 P1/P3：把风险预警静态卡片升级为可转派、可关闭、可升级的处置工作项，并接入调度员 Agent 触发链。
