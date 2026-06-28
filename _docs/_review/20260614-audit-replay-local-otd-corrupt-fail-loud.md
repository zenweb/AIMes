# 2026-06-14 Review - Audit Replay 本地 OTD 损坏 fail loud

## Findings
- `AuditDecisionReplayPanel` 是审计回放关键入口，本地 OTD 证据链损坏时不能静默失败。
- 现有实现已能检测本地 JSON 损坏并记录 `OTD 证据链加载失败`，但此前缺少专门回归测试。
- 本片只新增测试证据，没有改动生产代码。

## Verification
- 单文件单测：`audit-decision-replay-panel.test.ts` 25 passed。
- 完整前端 coverage：105 files / 755 tests passed。
- 损坏本地 OTD 载荷时，基础回放卡片仍为 2 张，默认回放详情仍显示急单重排链。

## Residual Risk
- 本片是组件单元证据，未重新跑真实浏览器截图。
- 若后续改动 OTD 本地存储 key 或 `readOtdEvidenceChainRecords` 的容错策略，需要同步更新本测试。
