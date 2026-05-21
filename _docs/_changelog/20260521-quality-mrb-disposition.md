# 2026-05-21 质量 MRB 报废补料处置

## 背景

`质量闭环` 已有返工事件和 CAPA 验证，但质量不合格的更硬分支仍偏薄：报废、补料、重建排产和客户交付影响没有形成同一条可审计链路。本次把 `INS-004 / WO-004` 装配间隙超差扩展为 MRB 报废补料决策，补齐质量事件对排产和 OTD 的真实影响。

## 变更

- 新增 `quality-mrb-disposition-sync.ts`，用 `aimes_quality_mrb_disposition` 保存 MRB 决策、责任动作、排产追踪和闭环结果。
- `质量闭环` 新增 MRB 报废补料面板，可生成 `AUD-QA-MRB-DISPOSITION-20260521`、`TRACE-QA-WO-004-MRB-DISPOSITION-20260521` 和 `TRACE-QA-WO-004-MRB-SCHEDULE-IMPACT-20260521`。
- MRB 决策写入统一 OTD 证据链 `质量MRB处置` 阶段；确认闭环后生成 `AUD-QA-MRB-CLOSURE-20260521` / `TRACE-QA-WO-004-MRB-CLOSURE-20260521`。
- `AI 排产` 事件队列读取 MRB 记录，新增 `WO-004 MRB 报废补料重排`，闭环前生成排产保护建议，闭环后转为复核建议。
- `AI 生产助手` 支持回答 MRB / 报废补料 / 质量报废影响，输出处置结论、OTD 影响、责任动作和审计追踪。
- `报表中心` 新增 MRB 对 OTD 的专项卡片，并在 CSV 导出中追加 `质量MRB处置` 与 `质量MRB动作` 行。
- `系统管理` Agent 治理新增质量 MRB 处置治理卡，展示状态、责任动作、审计编号和排产追踪。
- `审计日志` 复用统一 OTD 证据链，可回放 `质量MRB处置：WO-004 装配间隙超差 MRB 处置决策`。

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`：通过。
- `npm run test:e2e -- tests/e2e/quality.spec.ts -g "质量 MRB 报废补料决策联动排产和 OTD 复盘"`：1 passed。
