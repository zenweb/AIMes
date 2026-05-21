# 2026-05-21 POC 正式上线验收与 Hypercare 稳定运行监控

## 背景

上一轮已经把 POC 上线交付包推进到首批真实工单试点运行，但上线验收不能只停在“30 单跑通”。客户正式上线后还需要看到 7 天 Hypercare 期间 OTD、OEE、P1/P2 未关闭事件和 AI 建议采纳率是否持续稳定。本次把试点运行后的状态推进为正式上线验收和稳定运行监控闭环。

## 变更

- 新增 `poc-hypercare-sync.ts`，保存 `aimes_poc_hypercare_acceptance`，并写入统一 `OTD 复盘证据链` 的 `POC 上线验收` 阶段。
- `报表中心` 在首批真实工单试点运行闭环后新增 `生成上线验收与 Hypercare 监控包`：
  - 生成 `POC 正式上线验收与 Hypercare 稳定运行监控包`。
  - 固化 7 天 Hypercare 窗口、上线验收门禁、OTD `97%`、OEE `82%`、P1/P2 未关闭 `0`、AI 建议采纳率 `89%`。
  - 展示生产概览、实时监控、治理审计三类责任动作和追踪编号。
  - CSV 导出新增 `POCHypercare验收`、`POCHypercare指标`、`POCHypercare动作` 行。
- `生产概览` 新增 Hypercare 上线验收卡，首页可看到状态、OTD、OEE、P1/P2 未关闭数，并跳转实时监控和报表。
- `实时监控` 新增 `POC Hypercare 稳定运行监控` 区块，展示 OTD、OEE、异常告警、AI 建议采纳率和审计追踪。
- `AI 生产助手` 可回答“POC Hypercare 上线验收情况？”，输出验收门禁、当前指标、监控项和审计追踪。
- `系统管理` Agent 治理新增 POC Hypercare 治理卡，展示验收门禁、稳定指标和审计编号。
- `审计日志` 复用统一 OTD 证据链，自动回放 `TRACE-POC-HYPERCARE-ACCEPTANCE-20260521`。

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`：通过。
- `npm run test:e2e -- tests/e2e/report.spec.ts -g "POC 复盘签署后生成上线交付行动包"`：通过。

## 风险

- Hypercare 仍是前端本地演示态数据，后续需要接入真实上线项目、真实监控指标、后端持久化和客户验收签署流程。
