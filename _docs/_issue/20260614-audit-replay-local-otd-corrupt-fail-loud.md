# 2026-06-14 Issue - 本地 OTD 证据链损坏缺少回归证据

## Problem
- 审计回放面板会读取本地 OTD 证据链。
- 如果本地载荷被写坏，系统必须明确提示审计证据异常，不能静默吞掉。
- 同时，坏载荷不能让基础 AI 决策回放链不可用。

## Resolution
- 新增组件测试模拟 `aimes_otd_evidence_chain` 中的损坏 JSON。
- 断言 `.replay-sync-alert` 使用 `role="alert"` / `aria-live="assertive"` 暴露错误。
- 断言基础回放卡片和默认急单重排回放链仍可显示。

## Verification
- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts`：25 passed。
- `npm run test:unit:coverage`：105 files / 755 tests passed。
