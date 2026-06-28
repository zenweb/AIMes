# 2026-06-14 Review - Anomaly dispatch 启动恢复证据

## Findings
- `AnomalyBoard` 是现场异常到风险、排产、质量、采购闭环的入口。
- 已确认分流如果刷新后丢失，用户会误以为还没有处置，导致重复分流或审计链断点。
- 现有实现已读取启动分流记录并恢复按钮状态与最新 trace，但此前缺少专门单元证据。

## Verification
- 单文件单测：`anomaly-board.test.ts` 10 passed。
- 完整前端 coverage：105 files / 756 tests passed。
- 启动记录包含 `equipment-cnc001` 与 `material-batch` 时，对应事件按钮恢复为“已确认分流”，质量事件仍为“确认分流”。

## Residual Risk
- 本片是组件单元证据，未重新跑真实浏览器截图。
- 跨模块真实链路已有 `anomaly.spec.ts` 覆盖；若后续改动分流记录排序或后端返回协议，应追加真实浏览器复核。
