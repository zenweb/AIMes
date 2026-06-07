# RiskBoard 风险 SLA 晨会复核闭环真实浏览器证据

日期：2026-06-07

## 目标

补齐风险处置队列中“风险 SLA 逾期晨会复核包、责任动作闭环、跨模块回放”的真实 Chromium 证据：风险 SLA 复核不能只在风险页生成卡片，还必须联动排产、助手、Agent 治理、报表 OTD 证据链和审计回放。

## 本轮变更

- 本轮未修改产品代码。
- 复跑既有 e2e：`生成风险 SLA 晨会复核包并联动排产、助手、治理、报表和审计`。
- 使用 Nuxt production build + Playwright Chromium 项目验证真实浏览器链路。

## 真实浏览器证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/risk.spec.ts -g "生成风险 SLA 晨会复核包"
```

结果：

```text
Running 1 test using 1 worker
ok 1 [chromium] › tests\e2e\risk.spec.ts:94:3 › Risk 风险处置队列 › 生成风险 SLA 晨会复核包并联动排产、助手、治理、报表和审计 (3.1s)
1 passed (5.7s)
```

验证点：

- 风险页 `.risk-action-panel` 可生成 `风险 SLA 逾期晨会复核包`。
- 复核卡展示 `RISK-DAILY-20260521-001`、`AUD-RISK-SLA-REVIEW-20260521`、`TRACE-RISK-SLA-DAILY-REVIEW-20260521`。
- 点击 `确认责任动作闭环` 后显示 `晨会责任动作已闭环`。
- 闭环追踪为 `AUD-RISK-SLA-CLOSURE-20260521 / TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260521`。
- `localStorage.aimes_risk_sla_review` 保存 `closed` 状态和不少于 4 条责任动作。
- 排产页事件队列出现 `风险 SLA 逾期晨会复核包`，状态为 `已缓解`。
- 排产复核建议显示 `风险 SLA 闭环后的排产复核建议`，并引用闭环 trace。
- AI 助手可回答风险 SLA 晨会复核情况，并展示晨会编号、审计追踪和闭环追踪。
- Agent 治理页展示风险 SLA 治理卡，包含晨会编号、审计编号和闭环 trace。
- 报表页 OTD evidence chain 出现 `风险 SLA 逾期晨会复核包` 和 `风险 SLA 复核`。
- 审计页展示 `风险SLA回放 1`，并可回放决策链详情。
- 审计详情说明该复核已同步给 AI 排产、AI 生产助手、Agent 治理和报表 CSV，并核对排产保护、采购承诺、设备窗口和责任动作闭环。

## 边界

- 本轮是 A 轨真实浏览器证据，不关闭 B 轨发布闸门。
- 未跑完整风险 e2e 文件。
- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍未关闭。
